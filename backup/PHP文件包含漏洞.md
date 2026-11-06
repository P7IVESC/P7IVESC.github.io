![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/f3fd637de9ff.webp)

本次实验我们以dvwa的文件包含漏洞low等级作为对象，目标是读取D:\phpstudy_pro\WWW\DVWA\vulnerabilities\fi下的flag.txt文件内容。

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/2375fca5e48a.png)

查看源码可以看到，服务器端对page参数没有做任何的过滤跟检查。

通过将page参数设置为php://input，并在 POST 数据中传入 PHP 代码实现任意代码执行。

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/cd74981c7220.webp)

如下图我们将post数据改为查看php相关信息。

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/e034dde054e6.webp)

Post数据改为<?php system('dir');?>，即可获得当前目录路径

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/684e1e724815.webp)

我们可以看到目录中存在一个flag.txt。

当想查看敏感文件（如flag.txt，本次实验为自建）内容时，就可以利用php://filter 。

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/4e59a1ca4d51.webp)

我们使用php://filter/read=convert.base64-encode/resource=flag.txt来读取flag.txt文件内容并进行 Base64 编码显示。

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/281b8e84781d.webp)

然后将得到的编码进行解码，得到文件内容。

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/b8d035fdf7a3.webp)

例题：[ACTF2020 新生赛]Include

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/6bd24c041995.png)

这题题目就是flag.php，猜测flag就藏在这个文件里，只不过不在页面显示。

使用其他方法都会显示hacker

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/b7dcdaa95816.png)

所以想到使用编码的形式读取文件

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/c79bec5c26c4.png)

利用base64解码，得到flag

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/ea0816226b62.webp)

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/2ba8873feeb5.webp)

zip:// 可以访问压缩包里面的文件。当它与包含函数结合时，zip://流会被当作php文件 执行。从而实现任意代码执行。

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/cb214d78f526.webp)

于是我们创建一个文件放入我们的恶意代码（以<?php phpinfo(); ?> 为例演示过程），然后压缩成压缩包。

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/9ec555883c32.png)

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/2e539194eb36.png)

之后我们在page后面使用zip直接访问这个压缩包，并且执行里面的代码

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/329683f4a3e3.webp)

利用这个原理，结合上我们刚才获得的flag.txt的路径，我们就可以通过<?php system('type D:\\phpstudy_pro\\WWW\\DVWA\\vulnerabilities\\fi\\flag.txt'); ?> 访问flag.txt里的信息。

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/8e6c39b556d3.png)

data:// 同样类似与php://input，可以让用户来控制输入流，当它与包含函数结合时，用户输入的data://流会被当作php文件执行。从而导致任意代码执行。

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/c551590705fc.webp)

我们利用如下代码也能获得flag.txt的信息。

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/986aef662591.png)

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/f3af9f706d69.png)

phar:// 有点类似zip://同样可以导致任意代码执行。

使用phar://D:\Desktop\phpinfo.zip/phpinfo.txt，得到信息

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/bbb7f9f816dd.png)

日志包含

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/7f156757c5f8.webp)

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/f45e864da193.webp)

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/30f04ca2fe53.webp)

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/ef3d19a598a3.webp)

session包含

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/509256904244.webp)

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/79e4de23edfb.webp)

上面是通过phpinfo界面查看的，如果看不到phpinfo

那么可以尝试下面的常见地址

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/6796aaeed43a.png)

下面的示例代码是模拟靶场环境

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/3a5499015ce2.png)

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/a9478013bd41.webp)

复现：

第一步写入payload

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/18f3df8af81b.png)

第二步查看session

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/22f4fd70a225.png)

第三步包含session文件

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/e58aef7ccf1d.webp)

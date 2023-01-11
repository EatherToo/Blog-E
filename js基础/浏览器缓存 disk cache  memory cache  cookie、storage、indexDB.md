#### 浏览器缓存 disk cache / memory cache / cookie、storage、indexDB

1. disk cache
2. memory cache
3. 然后就说到http 缓存
4. 在然后就是数据持久化的问题
5. 在然后就是web worker的问题



1. memory cache 内存缓存

   从内存中取出需要的内容

2. disk cache 硬盘缓存

​		内存缓存没有命中，就从硬盘中取出缓存



​	memory cache有一种情况是base64格式的图片，直接从memory cache中取出

​	其他情况的from memory cache一般都是由http的强制缓存得来的



http强缓存的响应状态码有三种成功的状态响应

- 200 ok
- 200 from memory cache
- 200 from disk cache

200 ok是第一次获取资源时的响应，响应的size就直接是响应内容的大小

from memory cache是从内存缓存中拿到资源，所以它的size就变成了from memory cache，当一个浏览器tab被关闭，memory cache就被清除了，后续再打开相同的页面的话，若强缓存没有失效的话，就会返回200 from disk cache，从硬盘缓存中获取资源



##### 控制强缓存的响应头有两个

	1. cache-control  有六种值
	 - public
	 - private
	 - no-store
	 - no-cache
	 - max-age
	 - s-maxage
 	2. expires 值为缓存到期时间 => 存在缺点：修改客户端时间后会造成缓存的不准确 



##### 协商缓存  会返回304 not modified

有两对

- Last-Modified / If-modified-Since 两个值都是时间戳，前一个是响应头，后一个是请求头。=> 存在缺点：**如果这个资源在服务器上被修改了，但是最后的内容却没有变。这时候Last-Modified就匹配不上了，相当于多返回了一个相同的资源文件，浪费了流量。**
- E-tag / if-None-Match 优先级要更高 两个值都是资源的唯一标识，前一个是响应头，后一个是请求头







note: 

> ```pgsql
>  1. 先判断Cache-Control，在Cache-Control的max-age之内，直接返回200 from cache
>  2. 没有Cache-Control再判断Expires，再Expires之内，直接返回200 from cache
>  3. Cache-Control=no-cache或者不符合Expires，浏览器向服务器发送请求
>  4. 服务器同时判断ETag和Last-Modified，都一致，返回304，有任何一个不一致，返回200
> ```


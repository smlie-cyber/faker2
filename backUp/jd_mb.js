/*

 6 9,12 * * * jd_mb.js
*/
const $ = new Env('全民摸冰');
//Node.js用户请在jdCookie.js处填写京东ck;
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
const randomCount = $.isNode() ? 20 : 5;
const notify = $.isNode() ? require('./sendNotify') : '';
let merge = {}
let codeList = []
Exchange = $.isNode() ? (process.env.Cowexchange ? process.env.Cowexchange : false) : ($.getdata("Cowexchange") ? $.getdata("Cowexchange") : false);
//IOS等用户直接用NobyDa的jd cookie
let cookiesArr = [],
    cookie = '';
if ($.isNode()) {
    Object.keys(jdCookieNode).forEach((item) => {
        cookiesArr.push(jdCookieNode[item])
    })
    if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {};
} else {
    cookiesArr = [$.getdata('CookieJD'), $.getdata('CookieJD2'), ...jsonParse($.getdata('CookiesJD') || "[]").map(item => item.cookie)].filter(item => !!item);
}
const JD_API_HOST = `https://api.m.jd.com/client.action`;
!(async () => {
        if (!cookiesArr[0]) {
            $.msg($.name, '【提示】请先获取cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/', {
                "open-url": "https://bean.m.jd.com/"
            });
            return;
        }
        for (let i = 0; i < cookiesArr.length; i++) {
            cookie = cookiesArr[i];
            if (cookie) {
                $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])
                $.index = i + 1;
                $.isLogin = true;
                $.needhelp = true
                $.coolcoins = 0
                $.nickName = '';
                $.Authorization = "Bearer undefined"
                console.log(`\n******开始【京东账号${$.index}】${$.nickName || $.UserName}*********\n`);
                if (!$.isLogin) {
                    $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, {
                        "open-url": "https://bean.m.jd.com/bean/signIndex.action"
                    });
                    if ($.isNode()) {
                        await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
                    }
                    continue
                }
                await genToken()
                authres = await taskPostUrl("auth", {
                    "token": $.token,
                    "source": "01"
                })
                $.Authorization = `Bearer ${authres.access_token}`
                user = await taskUrl("get_user_info", "")
                console.log(`昵称：${user.nickname}\n剩余挑战值：${user.coins}\n清凉值：${user.cool_coins}\n今日已抽奖次数：${user.today_lottery_times}`)
                taskList = await taskUrl("task_state", "")
                productList = await taskUrl("shop_products", "")
                for (var o in taskList) {
                    switch (o) {
                        case "sign_in":
                            console.log("每日签到：")
                            if (taskList[o] == "1") console.log("  今日已签到")
                            else {
                                console.log("  去签到")
                                await taskUrl(o, "")
                            }
                            break
                        case "product_view": //浏览商品
                            console.log("浏览商品：")
                            console.log(`  今日已浏览${taskList[o].length}个商品`)
                            if (taskList[o].length != 12) {
                                pList = productList.products.filter(x => taskList[o].indexOf(x.id) == "-1")
                                for (product of pList) {
                                    console.log(`  去浏览${product.name} `)
                                    await taskUrl("product_view", `?product_id=${product.id}`)
                                }
                            }
                            break
                        case "shop_view": //关注浏览店铺
                            console.log("浏览店铺：")
                            console.log(`  今日已浏览${taskList[o].length}个商品`)
                            if (taskList[o].length < 6) {
                                shopList = productList.shops.filter(x => taskList[o].indexOf(x.id) == "-1")
                                for (shop of shopList) {
                                    console.log(`  去浏览${shop.name} `)
                                    await taskUrl("shop_view", `?shop_id=${shop.id}`)
                                }
                            }
                            break
                        case "today_invite_num": //邀请
                            console.log("邀请助力：")
                            console.log(`  已邀请${taskList[o].length}个小伙伴`)
                            if (taskList[o].length < 5) codeList.push(user.id)
                            break
                        case "meetingplace": //浏览会场
                            console.log("浏览会场：")
                            console.log(`  今日已浏览${taskList[o].length}会场`)
                            if (taskList[o].length < 8) {
                                meetingList = productList.meetingplace.filter(x => taskList[o].indexOf(x.id) == "-1")
                                for (meetingplace of meetingList) {
                                    console.log(`  去浏览${meetingplace.name} `)
                                    await taskUrl("meetingplace_view", `?meetingplace_id=${meetingplace.id}`)
                                }
                            }
                            break
                        default:
                            break
                    }
                }
                user = await taskUrl("get_user_info", "")
                console.log("去玩游戏")
                for (u = 0; u < Math.floor(user.coins / 3); u++) {
                    console.log(`  第${u+1}次游戏中`)
                    //开始游戏
                    let stares = await taskUrl("start_game", "")
                    if (stares.token) {
                        console.log("  开始游戏成功")
                        await $.wait(10000);
                        await taskUrl("game", `?token=${stares.token}&score=110`)
                    }
                }
                console.log("去抽奖")
                for (t = 0; t < 5 - user.today_lottery_times; t++) {
                    let lotteryes = await taskUrl("to_lottery", "")
                    console.log(lotteryes)
                    if (lotteryes.gift) console.log(`恭喜你获得 ${lotteryes.gift.prize.name} 类型： ${lotteryes.gift.type.match("coupon") ?"优惠券" : lotteryes.gift.type}`)
                    else console.log("🐮阿🐮阿,恭喜您获得了空气")
                }
                for (p = 0; p < codeList.length; p++) {
                    console.log(`为${codeList[p]}助力中...`)
                    await taskUrl("invite", `?inviter_id=${codeList[p]}`)
                }
            }
        }
        if (message.length != 0 && new Date().getHours() == 11) {
            if ($.isNode()) {
                //    await notify.sendNotify("星系牧场", `${message}\n牧场入口：QQ星儿童牛奶京东自营旗舰店->星系牧场\n\n吹水群：https://t.me/wenmouxx`);
            } else {
                $.msg($.name, "", '全民摸冰' + message)
            }
        }
    })()
    .catch((e) => $.logErr(e))
    .finally(() => $.done())
//获取活动信息



//genToken
function genToken() {
    let config = {
        url: 'https://api.m.jd.com/client.action?functionId=isvObfuscator&clientVersion=10.0.8&build=89053&client=android&d_brand=HUAWEI&d_model=FRD-AL10&osVersion=8.0.0&screen=1792*1080&partner=huawei&oaid=7afefff5-fffe-40ee-f3de-ffe2ff2fe001&eid=eidAe19a8122a1s2xg+0aWybTLCCATsD6oJbEcYPteQMa3ttkXFlkcAdMo+uVF++BjcBVVNjMkIoFnW2bzHDBnLN0aukEYW72btJTe2aQ4xqyuZqRExl&sdkVersion=26&lang=zh_CN&uuid=5f3a6b660a7d29be&aid=5f3a6b660a7d29be&area=27_2442_2444_31912&networkType=4g&wifiBssid=unknown&uts=0f31TVRjBSsqndu4%2FjgUPz6uymy50MQJNuUBMiXpghp5mwBH3zhv1rOuSPEwsLjdPic0zNM6Lj6PpFnIuEOquU1jRYinqzNTeY4975Q%2BY0bAj1wlPztJiG9oagIGX5VE2sOe5rDgMdLlMkXFRaAAR9poPzL4f6KOaDmmcpTJFuB%2BkHswe5crq3X4UvjWD8PmvNm8KpDaQmvW6sbcOUE7Vw%3D%3D&uemps=0-0&harmonyOs=0&st=1626874286410&sign=c1bbfde69bd0d06fc19db58dff7291f5&sv=102',
        body: 'body=%7B%22id%22%3A%22%22%2C%22url%22%3A%22https%3A%2F%2Fxinrui2-isv.isvjcloud.com%22%7D&',
        headers: {
            'Host': 'api.m.jd.com',
            'accept': '*/*',
            'user-agent': 'JD4iPhone/167490 (iPhone; iOS 14.2; Scale/3.00)',
            'accept-language': 'zh-Hans-JP;q=1, en-JP;q=0.9, zh-Hant-TW;q=0.8, ja-JP;q=0.7, en-US;q=0.6',
            'content-type': 'application/x-www-form-urlencoded',
            'Cookie': cookie
        }
    }
    return new Promise(resolve => {
        $.post(config, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${$.name} API请求失败，请检查网路重试`);
                    console.log(`${JSON.stringify(err)}`)
                } else {
                    data = JSON.parse(data);
                    $.token = data['token']
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data);
            }
        })
    })
}


function taskUrl(url, data) {
    let body = {
        url: `https://xinrui2-isv.isvjcloud.com/api/${url}${data}`,
        headers: {
            'Host': 'xinrui2-isv.isvjcloud.com',
            //     'Accept': 'application/x.jd-school-raffle.v1+json',
            'X-Requested-With': 'XMLHttpRequest',
            "Authorization": $.Authorization,
            //    X-Requested-With: "XMLHttpRequest",
            //       source: "01",
            'Referer': 'https://xinrui2-isv.isvjcloud.com/jd-tourism/loading/?channel=zjyy&sid=ff8ed71432ebffb00b0caf9c6e7673ew&un_area=27_2442_2444_31912',
            'user-agent': 'jdapp;android;10.0.4;11;2393039353533623-7383235613364343;network/wifi;model/Redmi K30;addressid/138549750;aid/290955c2782e1c44;oaid/b30cf82cacfa8972;osVer/30;appBuild/88641;partner/xiaomi001;eufv/1;jdSupportDarkMode/0;Mozilla/5.0 (Linux; Android 11; Redmi K30 Build/RKQ1.200826.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045537 Mobile Safari/537.36',
            //     'content-type': 'application/x-www-form-urlencoded',
            //     'Cookie': `${cookie} ;`,
        }
    }
    //   console.log(body.url)
    return new Promise(resolve => {
        $.get(body, async (err, resp, data) => {
            try {
                if (err) {
                    //     console.log(`${err}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    //      console.log(data)
                    data = JSON.parse(data);
                    if (data.coins && url != "get_user_info") console.log(`    操作成功,当前挑战值${data.coins}`)
                    if (data.get_cool_coins) {
                        console.log(`    操作成功,获得清凉值${data.get_cool_coins},当前清凉值${data.user_cool_coins}`)
                    }
                    resolve(data)
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data);
            }
        })
    })
}

function taskPostUrl(url, data) {
    let body = {
        url: `https://xinrui2-isv.isvjcloud.com/api/${url}`,
        json: data,
        headers: {
            'Host': 'xinrui2-isv.isvjcloud.com',
            'Accept': 'application/x.jd-school-raffle.v1+json',
            //     'X-Requested-With': 'XMLHttpRequest',
            "Authorization": $.Authorization,
            'Referer': 'https://xinrui2-isv.isvjcloud.com/jd-tourism/loading/?channel=zjyy&sid=ff8ed71432ebffb00b0caf9c6e7673ew&un_area=27_2442_2444_31912',
            'user-agent': 'jdapp;android;10.0.4;11;2393039353533623-7383235613364343;network/wifi;model/Redmi K30;addressid/138549750;aid/290955c2782e1c44;oaid/b30cf82cacfa8972;osVer/30;appBuild/88641;partner/xiaomi001;eufv/1;jdSupportDarkMode/0;Mozilla/5.0 (Linux; Android 11; Redmi K30 Build/RKQ1.200826.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045537 Mobile Safari/537.36',
            //     'content-type': 'application/x-www-form-urlencoded',
            //     'Cookie': `${cookie} ;`,
        }
    }
    return new Promise(resolve => {
        $.post(body, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    data = JSON.parse(data);
                    resolve(data)
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data);
            }
        })
    })
}
function jsonParse(str) {
    if (typeof str == "string") {
        try {
            return JSON.parse(str);
        } catch (e) {
            console.log(e);
            $.msg($.name, '', '请勿随意在BoxJs输入框修改内容\n建议通过脚本去获取cookie')
            return [];
        }
    }
}
// prettier-ignore
function Env(t,e){"undefined"!=typeof process&&JSON.stringify(process.env).indexOf("GITHUB")>-1&&process.exit(0);class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}


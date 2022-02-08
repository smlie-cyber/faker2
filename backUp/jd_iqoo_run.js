/**
 * 写着玩的，没水了，跑个寂寞，有很低的几率抽实物，愿意跑的跑，PS：被菜狗薅干的
 cron 2 12 28-31,1-12 8,9 * https://raw.githubusercontent.com/star261/jd/main/scripts/jd_iqoo_run.js
 * */
const $ = new Env('iqoo生而为赢酷跑');
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
const notify = $.isNode() ? require('./sendNotify') : '';
let cookiesArr = [];
if ($.isNode()) {
    Object.keys(jdCookieNode).forEach((item) => {
        cookiesArr.push(jdCookieNode[item])
    })
    if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {
    };
} else {
    cookiesArr = [
        $.getdata("CookieJD"),
        $.getdata("CookieJD2"),
        ...$.toObj($.getdata("CookiesJD") || "[]").map((item) => item.cookie)].filter((item) => !!item);
}
!(async () => {
    let res = [];
    try{res = await getAuthorShareCode('https://raw.githubusercontent.com/star261/jd/main/code/iqooCode.json');}catch (e) {}
    if(!res){
        try{res = await getAuthorShareCode('https://gitee.com/star267/share-code/raw/master/iqooCode.json');}catch (e) {}
        if(!res){res = [{"id":"902082602","uid":""},{"id":"902082601","uid":""}];}
    }
    if(res.length === 0){console.log(`获取活动列表失败`)};
    if (!cookiesArr[0]) {
        $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
        return;
    }
    for (let i = 0; i < cookiesArr.length; i++) {
        getUA();
        $.index = i + 1;
        $.cookie = cookiesArr[i];
        $.oldcookie = cookiesArr[i];
        $.isLogin = true;
        $.nickName = '';
        await TotalBean();
        $.UserName = decodeURIComponent($.cookie.match(/pt_pin=([^; ]+)(?=;?)/) && $.cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1]);
        console.log(`\n*****开始【京东账号${$.index}】${$.nickName || $.UserName}*****\n`);
        if (!$.isLogin) {
            $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
            if ($.isNode()) {
                await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
            }
            continue
        }
        for (let j = 0; j < res.length; j++) {
            $.activityID = res[j].id;
            $.shareUuid = res[j].uid;
            console.log(`\n活动ID：`+ $.activityID);
            await main();
            await $.wait(1000);
        }
    }
})().catch((e) => {
    $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
}).finally(() => {
    $.done();
});

async function main() {
    $.token = ``;
    $.pin = ``;
    $.LZ_TOKEN_KEY = '';
    $.LZ_TOKEN_VALUE = '';
    $.lz_jdpin_token = '';
    await getToken();
    if ($.token === ``) {console.log(`获取token失败`);return;}
    console.log(`token:${$.token}`);
    await getWxCommonInfoToken();
    if(!$.LZ_TOKEN_KEY || !$.LZ_TOKEN_VALUE){
        console.log(`初始化失败`);return;
    }
    await $.wait(1000);
    $.shopId = ``;
    await takePostRequest('getSimpleActInfoVo');
    if ($.shopid === ``) {console.log(`获取shopid失败`);return;}
    console.log(`shopid:${$.shopid}`)
    await $.wait(1000);
    $.pin = '';
    await getMyPing();
    if ($.pin === ``) {$.hotFlag = true;console.log(`获取pin失败,该账号可能是黑号`);return;}
    await $.wait(1000);
    await accessLogWithAD();
    await $.wait(1000);
    await $.wait(1000);
    $.attrTouXiang = 'https://img10.360buyimg.com/imgzone/jfs/t1/7020/27/13511/6142/5c5138d8E4df2e764/5a1216a3a5043c5d.png'
    await getUserInfo();
    await getHtml();
    $.activityData = {};
    await takePostRequest('activityContent');
    if (JSON.stringify($.activityData) === `{}`) {console.log(`获取活动详情失败`);return;}
    console.log(`获取活动详情成功`);
    $.uid = $.activityData.uid;
    console.log(`助力码：`+$.uid);
    if($.shareUuid !== '' && $.activityData.openCardStatus === 0){
        //await takePostRequest('myfriends');
        //await $.wait(2000);
        console.log(`执行助力`);
        await takePostRequest('helpFriend');
        await $.wait(2000);
    }
    console.log(`执行一次游戏`);
    $.gameToken = '';
    await takePostRequest('start');
    if($.gameToken !== ''){
        console.log(`等待30S。。。。`);
        await $.wait(30000);
        $.endInfo = {}
        await takePostRequest('end');
        if($.endInfo){
            console.log(`游戏结束，获得积分：`+$.endInfo.addScore);
            if($.endInfo.chance !== 0){
                await $.wait(3000);
                console.log(`抽奖`);
                //await takePostRequest('myprize');
                //await $.wait(1000);
                await takePostRequest('luckydraw');
            }
        }
    }
}

async function takePostRequest(type) {
    let url = '';
    let body = ``;
    switch (type) {
        case 'getSimpleActInfoVo':
            url = 'https://lzdz-isv.isvjcloud.com/dz/common/getSimpleActInfoVo';
            body = `activityId=${$.activityID}`;
            break;
        case 'activityContent':
            url = 'https://lzdz-isv.isvjcloud.com/dingzhi/iqoo/zskxj/activityContent';
            body = `activityId=${$.activityID}&pin=${encodeURIComponent($.pin)}&pinImg=${encodeURIComponent($.attrTouXiang)}&nick=${encodeURIComponent($.nickname)}&cjyxPin=&cjhyPin=&shareUuid=${$.shareUuid}&picId=`;
            break;
        case 'start':
            url = 'https://lzdz-isv.isvjcloud.com/dingzhi/iqoo/zskxj/game/start';
            body = `activityId=${$.activityID}&pin=${encodeURIComponent($.pin)}`;
            break;
        case 'end':
            url = 'https://lzdz-isv.isvjcloud.com/dingzhi/iqoo/zskxj/game/end';
            let reqtime = Date.now();
            let score = 1500;
            let gameId = $.gameToken;
            let sign = getAA(reqtime,score,gameId)
            body = `activityId=${$.activityID}&pin=${encodeURIComponent($.pin)}&reqtime=${reqtime}&score=${score}&gameId=${gameId}&data=0&sign=${sign}`;
            break;
        case 'luckydraw':
            url = 'https://lzdz-isv.isvjcloud.com/dingzhi/iqoo/zskxj/luckydraw';
            body = `activityId=${$.activityID}&pin=${encodeURIComponent($.pin)}&type=0`;
            break;
        case 'helpFriend':
            url = 'https://lzdz-isv.isvjcloud.com/dingzhi/iqoo/zskxj/helpFriend';
            body = `activityId=${$.activityID}&pin=${encodeURIComponent($.pin)}&shareUuid=${$.shareUuid}`;
            break;
        case 'myfriends':
            url = 'https://lzdz-isv.isvjcloud.com/dingzhi/iqoo/zskxj/myfriends';
            body = `activityId=${$.activityID}&pin=${encodeURIComponent($.pin)}`;
            break;
        case 'myprize':
            url = 'https://lzdz-isv.isvjcloud.com/dingzhi/iqoo/zskxj/myprize';
            body = `activityId=${$.activityID}&pin=${encodeURIComponent($.pin)}`;
            break;
        default:
            console.log(`错误${type}`);
    }
    let myRequest = getPostRequest(url, body);
    return new Promise(async resolve => {
        $.post(myRequest, (err, resp, data) => {
            try {
                dealReturn(type, data);
            } catch (e) {
                console.log(data);
                $.logErr(e, resp)
            } finally {
                resolve();
            }
        })
    })
}
var _0xodj='jsjiami.com.v6',_0x2cf9=[_0xodj,'w5dewp3ChcKC','CMOVw4bCiMK3w4fCocKSw5YXwrrCtXvDoMO8N8KKXcOgw7bDo8OKw4oFP8KBw4FYRsOdwq7DnB1s','Mi3DojQ2','yjsqMjkhGiOlamNixqD.Pgczomt.v6=='];(function(_0x2d8f05,_0x4b81bb,_0x4d74cb){var _0x32719f=function(_0x2dc776,_0x362d54,_0x2576f4,_0x5845c1,_0x4fbc7a){_0x362d54=_0x362d54>>0x8,_0x4fbc7a='po';var _0x292610='shift',_0x151bd2='push';if(_0x362d54<_0x2dc776){while(--_0x2dc776){_0x5845c1=_0x2d8f05[_0x292610]();if(_0x362d54===_0x2dc776){_0x362d54=_0x5845c1;_0x2576f4=_0x2d8f05[_0x4fbc7a+'p']();}else if(_0x362d54&&_0x2576f4['replace'](/[yqMkhGOlNxqDPgzt=]/g,'')===_0x362d54){_0x2d8f05[_0x151bd2](_0x5845c1);}}_0x2d8f05[_0x151bd2](_0x2d8f05[_0x292610]());}return 0xa2dff;};return _0x32719f(++_0x4b81bb,_0x4d74cb)>>_0x4b81bb^_0x4d74cb;}(_0x2cf9,0x6e,0x6e00));var _0x5108=function(_0x50b579,_0x1a4950){_0x50b579=~~'0x'['concat'](_0x50b579);var _0x4606cd=_0x2cf9[_0x50b579];if(_0x5108['KTjaYN']===undefined){(function(){var _0xe884da=typeof window!=='undefined'?window:typeof process==='object'&&typeof require==='function'&&typeof global==='object'?global:this;var _0x5f5d37='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';_0xe884da['atob']||(_0xe884da['atob']=function(_0x4534d8){var _0x345ca1=String(_0x4534d8)['replace'](/=+$/,'');for(var _0x31752b=0x0,_0x14d268,_0x5398b5,_0xdbc588=0x0,_0x2d4af6='';_0x5398b5=_0x345ca1['charAt'](_0xdbc588++);~_0x5398b5&&(_0x14d268=_0x31752b%0x4?_0x14d268*0x40+_0x5398b5:_0x5398b5,_0x31752b++%0x4)?_0x2d4af6+=String['fromCharCode'](0xff&_0x14d268>>(-0x2*_0x31752b&0x6)):0x0){_0x5398b5=_0x5f5d37['indexOf'](_0x5398b5);}return _0x2d4af6;});}());var _0x416a36=function(_0x100e54,_0x1a4950){var _0x40a0d0=[],_0x351dd5=0x0,_0x275161,_0x22469d='',_0x58634e='';_0x100e54=atob(_0x100e54);for(var _0x5cda73=0x0,_0x47d4f6=_0x100e54['length'];_0x5cda73<_0x47d4f6;_0x5cda73++){_0x58634e+='%'+('00'+_0x100e54['charCodeAt'](_0x5cda73)['toString'](0x10))['slice'](-0x2);}_0x100e54=decodeURIComponent(_0x58634e);for(var _0x2f48ed=0x0;_0x2f48ed<0x100;_0x2f48ed++){_0x40a0d0[_0x2f48ed]=_0x2f48ed;}for(_0x2f48ed=0x0;_0x2f48ed<0x100;_0x2f48ed++){_0x351dd5=(_0x351dd5+_0x40a0d0[_0x2f48ed]+_0x1a4950['charCodeAt'](_0x2f48ed%_0x1a4950['length']))%0x100;_0x275161=_0x40a0d0[_0x2f48ed];_0x40a0d0[_0x2f48ed]=_0x40a0d0[_0x351dd5];_0x40a0d0[_0x351dd5]=_0x275161;}_0x2f48ed=0x0;_0x351dd5=0x0;for(var _0x15b967=0x0;_0x15b967<_0x100e54['length'];_0x15b967++){_0x2f48ed=(_0x2f48ed+0x1)%0x100;_0x351dd5=(_0x351dd5+_0x40a0d0[_0x2f48ed])%0x100;_0x275161=_0x40a0d0[_0x2f48ed];_0x40a0d0[_0x2f48ed]=_0x40a0d0[_0x351dd5];_0x40a0d0[_0x351dd5]=_0x275161;_0x22469d+=String['fromCharCode'](_0x100e54['charCodeAt'](_0x15b967)^_0x40a0d0[(_0x40a0d0[_0x2f48ed]+_0x40a0d0[_0x351dd5])%0x100]);}return _0x22469d;};_0x5108['WIeiSn']=_0x416a36;_0x5108['TdXuZs']={};_0x5108['KTjaYN']=!![];}var _0x730a38=_0x5108['TdXuZs'][_0x50b579];if(_0x730a38===undefined){if(_0x5108['EnDiiL']===undefined){_0x5108['EnDiiL']=!![];}_0x4606cd=_0x5108['WIeiSn'](_0x4606cd,_0x1a4950);_0x5108['TdXuZs'][_0x50b579]=_0x4606cd;}else{_0x4606cd=_0x730a38;}return _0x4606cd;};function getAA(_0x2ac542,_0x557cf9,_0x1dc011){var _0x22ebd6={'hPswk':function(_0x7caabe,_0x4f856b){return _0x7caabe+_0x4f856b;},'AShns':function(_0x3284d6,_0x2c8265){return _0x3284d6+_0x2c8265;},'ehytr':function(_0x5cea1f,_0x3a006f){return _0x5cea1f+_0x3a006f;},'YdjND':function(_0x5cbae7,_0x521dd2){return _0x5cbae7(_0x521dd2);}};let _0x210b66=_0x22ebd6[_0x5108('0','j96*')](_0x22ebd6[_0x5108('1','H]K5')](_0x22ebd6['ehytr'](_0x1dc011,',')+_0x2ac542+',',_0x557cf9),_0x5108('2','nEH7'));return _0x22ebd6['YdjND'](AA,_0x210b66);};_0xodj='jsjiami.com.v6';
function dealReturn(type, data) {
    try {
        data = JSON.parse(data);
    } catch (e) {
        console.log(`执行任务异常`);
        console.log(data);
        $.runFalag = false;
        $.canRun = false;
    }
    switch (type) {
        case 'getSimpleActInfoVo':
            if (data.result) {
                $.shopid = data.data.venderId;
            }
            break;
        case 'activityContent':
            if (data.data && data.result && data.count === 0) {
                $.activityData = data.data;
            } else {
                console.log(JSON.stringify(data));
            }
            break;
        case 'start':
            if (data.data){
                $.gameToken = data.data;
            }else{
                console.log(JSON.stringify(data));
            }
            return;
        case 'end':
            if (data.data){
                $.endInfo = data.data;
            }else{
                console.log(JSON.stringify(data));
            }
            return;
        case 'luckydraw':
        case 'helpFriend':
        case 'myfriends':
        case 'myprize':
            console.log(JSON.stringify(data));
            return;
        default:
            console.log(JSON.stringify(data));
    }
}
async function getUserInfo() {
    const url = `https://lzdz-isv.isvjcloud.com/wxActionCommon/getUserInfo`;
    const body = `pin=${encodeURIComponent($.pin)}`;
    let myRequest = getPostRequest(url, body);
    return new Promise(resolve => {
        $.post(myRequest, (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                }
                else {
                    if(data){
                        data = JSON.parse(data);
                        if(data.count === 0 && data.result){
                            $.attrTouXiang = data.data.yunMidImageUrl
                            != data.data.yunMidImageUrl ? $.attrTouXiang = data.data.yunMidImageUrl : $.attrTouXiang = "https://img10.360buyimg.com/imgzone/jfs/t1/7020/27/13511/6142/5c5138d8E4df2e764/5a1216a3a5043c5d.png"
                        }
                    }
                }
            } catch (e) {
                console.log(e, resp)
            } finally {
                resolve();
            }
        })
    })
}
function accessLogWithAD() {
    let pageurl = `https://lzdz-isv.isvjcloud.com/dingzhi/iqoo/zskxj/activity/${$.activityID}?activityId=${$.activityID}&shareUuid=${$.shareUuid}`
    console.log(`活动地址：`+pageurl);
    let body = `venderId=${$.shopid}&code=99&pin=${encodeURIComponent($.pin)}&activityId=${$.activityID}&pageUrl=${encodeURIComponent(pageurl)}&subType=app&adSource=null`
    let url=`https://lzdz-isv.isvjcloud.com/common/accessLogWithAD`;
    let myRequest = getPostRequest(url, body);
    return new Promise(resolve => {
        $.post(myRequest, (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    let setcookie = resp['headers']['set-cookie'] || resp['headers']['Set-Cookie'] || ''
                    if(setcookie){
                        let LZ_TOKEN_KEY = setcookie.filter(row => row.indexOf("LZ_TOKEN_KEY") !== -1)[0]
                        if(LZ_TOKEN_KEY && LZ_TOKEN_KEY.indexOf("LZ_TOKEN_KEY=") > -1){
                            $.LZ_TOKEN_KEY = LZ_TOKEN_KEY.split(';') && (LZ_TOKEN_KEY.split(';')[0]) || ''
                            $.LZ_TOKEN_KEY = $.LZ_TOKEN_KEY.replace('LZ_TOKEN_KEY=','')
                        }
                        let LZ_TOKEN_VALUE = setcookie.filter(row => row.indexOf("LZ_TOKEN_VALUE") !== -1)[0]
                        if(LZ_TOKEN_VALUE && LZ_TOKEN_VALUE.indexOf("LZ_TOKEN_VALUE=") > -1){
                            $.LZ_TOKEN_VALUE = LZ_TOKEN_VALUE.split(';') && (LZ_TOKEN_VALUE.split(';')[0]) || ''
                            $.LZ_TOKEN_VALUE = $.LZ_TOKEN_VALUE.replace('LZ_TOKEN_VALUE=','')
                        }
                    }
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data);
            }
        })
    })
}
async function getMyPing() {
    let url = 'https://lzdz-isv.isvjcloud.com/customer/getMyPing';
    let body = `userId=${$.shopid}&token=${encodeURIComponent($.token)}&fromType=APP`;
    let myRequest = getPostRequest(url, body);
    return new Promise(async resolve => {
        $.post(myRequest, (err, resp, data) => {
            try {
                let setcookie = resp['headers']['set-cookie'] || resp['headers']['Set-Cookie'] || ''
                if(setcookie){
                    let lz_jdpin_token = setcookie.filter(row => row.indexOf("lz_jdpin_token") !== -1)[0]
                    $.lz_jdpin_token = ''
                    if(lz_jdpin_token && lz_jdpin_token.indexOf("lz_jdpin_token=") > -1){
                        $.lz_jdpin_token = lz_jdpin_token.split(';') && (lz_jdpin_token.split(';')[0] + ';') || ''
                    }
                    let LZ_TOKEN_VALUE = setcookie.filter(row => row.indexOf("LZ_TOKEN_VALUE") !== -1)[0]
                    if(LZ_TOKEN_VALUE && LZ_TOKEN_VALUE.indexOf("LZ_TOKEN_VALUE=") > -1){
                        $.LZ_TOKEN_VALUE = LZ_TOKEN_VALUE.split(';') && (LZ_TOKEN_VALUE.split(';')[0]) || ''
                        $.LZ_TOKEN_VALUE = $.LZ_TOKEN_VALUE.replace('LZ_TOKEN_VALUE=','')
                    }
                }
                try {
                    data = JSON.parse(data);
                } catch (e) {
                    console.log(`执行任务异常`);
                    console.log(data);
                    $.runFalag = false;
                    $.canRun = false;
                }
                if (data.data && data.data.secretPin) {
                    $.pin = data.data.secretPin
                    $.nickname = data.data.nickname
                } else {
                    console.log(JSON.stringify(data));
                }
            } catch (e) {
                console.log(data);
                $.logErr(e, resp)
            } finally {
                resolve();
            }
        })
    })
}
function getPostRequest(url, body) {
    const headers = {
        'X-Requested-With' : `XMLHttpRequest`,
        'Connection' : `keep-alive`,
        'Accept-Encoding' : `gzip, deflate, br`,
        'Content-Type' : `application/x-www-form-urlencoded`,
        'Origin' : `https://lzdz-isv.isvjcloud.com`,
        "User-Agent": $.UA,
        'Cookie': `${$.cookie} LZ_TOKEN_KEY=${$.LZ_TOKEN_KEY}; LZ_TOKEN_VALUE=${$.LZ_TOKEN_VALUE}; AUTH_C_USER=${$.pin}; ${$.lz_jdpin_token}`,
        'Host' : `lzdz-isv.isvjcloud.com`,
        'Referer' : `https://lzdz-isv.isvjcloud.com/dingzhi/iqoo/zskxj/activity/${$.activityID}?activityId=${$.activityID}&shareUuid=${$.shareUuid}`,
        'Accept-Language' : `zh-cn`,
        'Accept' : `application/json`
    };
    return {url: url, method: `POST`, headers: headers, body: body};
}
function getHtml() {
    let config ={
        url:`https://lzdz-isv.isvjcloud.com/dingzhi/iqoo/zskxj/activity/${$.activityID}?activityId=${$.activityID}&shareUuid=${$.shareUuid}`,
        headers: {
            'Host':'lzdz-isv.isvjcloud.com',
            'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Cookie': `IsvToken=${$.token};${$.cookie} LZ_TOKEN_KEY=${$.LZ_TOKEN_KEY}; LZ_TOKEN_VALUE=${$.LZ_TOKEN_VALUE}; AUTH_C_USER=${$.pin}; ${$.lz_jdpin_token}`,
            "User-Agent": $.UA,
            'Accept-Language':'zh-cn',
            'Accept-Encoding':'gzip, deflate, br',
            'Connection':'keep-alive'
        }
    }
    return new Promise(resolve => {
        $.get(config, (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {

                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data);
            }
        })
    })
}
function getWxCommonInfoToken () {
    const url = `https://lzdz-isv.isvjcloud.com/wxCommonInfo/token`;
    const method = `POST`;
    const headers = {
        'X-Requested-With' : `XMLHttpRequest`,
        'Connection' : `keep-alive`,
        'Accept-Encoding' : `gzip, deflate, br`,
        'Content-Type' : `application/x-www-form-urlencoded`,
        'Origin' : `https://lzdz-isv.isvjcloud.com`,
        'User-Agent' : $.UA,
        'Cookie' : $.cookie,
        'Host' : `lzdz-isv.isvjcloud.com`,
        'Referer' : `https://lzdz-isv.isvjcloud.com/dingzhi/iqoo/zskxj/activity/${$.activityID}?activityId=${$.activityID}`,
        'Accept-Language' : `zh-cn`,
        'Accept' : `application/json`
    };
    const body = ``;
    const myRequest = {url: url, method: method, headers: headers, body: body};
    return new Promise(resolve => {
        $.post(myRequest, async (err, resp, data) => {
            try {
                let res = $.toObj(data);
                if(typeof res == 'object' && res.result === true){
                    if(typeof res.data.LZ_TOKEN_KEY != 'undefined') $.LZ_TOKEN_KEY = res.data.LZ_TOKEN_KEY;
                    if(typeof res.data.LZ_TOKEN_VALUE != 'undefined') $.LZ_TOKEN_VALUE = res.data.LZ_TOKEN_VALUE;
                }else if(typeof res == 'object' && res.errorMessage){
                    console.log(`token ${res.errorMessage || ''}`)
                }else{
                    console.log(data)
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data);
            }
        })
    })
}
function getToken() {
    let config = {
        url: 'https://api.m.jd.com/client.action?functionId=isvObfuscator',
        body: 'area=2_2830_51828_0&body=%7B%22url%22%3A%22https%3A%5C/%5C/lzdz-isv.isvjcloud.com%22%2C%22id%22%3A%22%22%7D&build=167802&client=apple&clientVersion=10.1.2&d_brand=apple&d_model=iPhone9%2C2&eid=eidI42470115RDhDRjM1NjktODdGQi00RQ%3D%3DB3mSBu%2BcGp7WhKUUyye8/kqi1lxzA3Dv6a89ttwC7YFdT6JFByyAtAfO0TOmN9G2os20ud7RosfkMq80&isBackground=N&joycious=94&lang=zh_CN&networkType=wifi&networklibtype=JDNetworkBaseAF&openudid=5a8a5743a5d2a4110a8ed396bb047471ea120c6a&osVersion=14.6&partner=apple&rfs=0000&scope=01&screen=1242%2A2208&sign=d74c43486b7a3b14ac4de12fdeab8a93&st=1630157006494&sv=101',
        headers: {
            'Host': 'api.m.jd.com',
            'accept': '*/*',
            'user-agent': 'JD4iPhone/167490 (iPhone; iOS 14.2; Scale/3.00)',
            'accept-language': 'zh-Hans-JP;q=1, en-JP;q=0.9, zh-Hant-TW;q=0.8, ja-JP;q=0.7, en-US;q=0.6',
            'content-type': 'application/x-www-form-urlencoded',
            'Cookie': $.cookie
        }
    }
    return new Promise(resolve => {
        $.post(config, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
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
function getUA(){
    $.UA = `jdapp;iPhone;10.0.10;14.3;${randomString(40)};network/wifi;model/iPhone12,1;addressid/4199175193;appBuild/167741;jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1`
}
function randomString(e) {
    e = e || 32;
    let t = "abcdef0123456789", a = t.length, n = "";
    for (i = 0; i < e; i++)
        n += t.charAt(Math.floor(Math.random() * a));
    return n
}
function TotalBean() {
    return new Promise(async resolve => {
        const options = {
            "url": `https://wq.jd.com/user/info/QueryJDUserInfo?sceneval=2`,
            "headers": {
                "Accept": "application/json,text/plain, */*",
                "Content-Type": "application/x-www-form-urlencoded",
                "Accept-Encoding": "gzip, deflate, br",
                "Accept-Language": "zh-cn",
                "Connection": "keep-alive",
                "Cookie": $.cookie,
                "Referer": "https://wqs.jd.com/my/jingdou/my.shtml?sceneval=2",
                "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1")
            }
        }
        $.post(options, (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    if (data) {
                        data = JSON.parse(data);
                        if (data['retcode'] === 13) {
                            $.isLogin = false; //cookie过期
                            return
                        }
                        if (data['retcode'] === 0) {
                            $.nickName = (data['base'] && data['base'].nickname) || $.UserName;
                        } else {
                            $.nickName = $.UserName
                        }
                    } else {
                        console.log(`京东服务器返回空数据`)
                    }
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve();
            }
        })
    })
}
function getAuthorShareCode(url) {
    return new Promise(async resolve => {
        const options = {
            "url": `${url}`,
            "timeout": 10000,
            "headers": {
                "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1 Edg/87.0.4280.88"
            }
        };
        if ($.isNode() && process.env.TG_PROXY_HOST && process.env.TG_PROXY_PORT) {
            const tunnel = require("tunnel");
            const agent = {
                https: tunnel.httpsOverHttp({
                    proxy: {
                        host: process.env.TG_PROXY_HOST,
                        port: process.env.TG_PROXY_PORT * 1
                    }
                })
            }
            Object.assign(options, { agent })
        }
        $.get(options, async (err, resp, data) => {
            try {
                if (err) {
                } else {
                    if (data) data = JSON.parse(data)
                }
            } catch (e) {
                // $.logErr(e, resp)
            } finally {
                resolve(data || []);
            }
        })
        await $.wait(10000)
        resolve();
    })
}
function Env(t,e){"undefined"!=typeof process&&JSON.stringify(process.env).indexOf("GITHUB")>-1&&process.exit(0);class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}
var hexcase = 0;  /* hex output format. 0 - lowercase; 1 - uppercase        */
var chrsz   = 8;  /* bits per input character. 8 - ASCII; 16 - Unicode      */
function AA(s){ return binl2hex(core_md5(str2binl(s), s.length * chrsz));}
function core_md5(x, len){/* append padding */x[len >> 5] |= 0x80 << ((len) % 32);x[(((len + 64) >>> 9) << 4) + 14] = len;var a =  1732584193;var b = -271733879;var c = -1732584194;var d =  271733878;for(var i = 0; i < x.length; i += 16){var olda = a;var oldb = b;var oldc = c;var oldd = d;a = md5_ff(a, b, c, d, x[i+ 0], 7 , -680876936);d = md5_ff(d, a, b, c, x[i+ 1], 12, -389564586);c = md5_ff(c, d, a, b, x[i+ 2], 17,  606105819);b = md5_ff(b, c, d, a, x[i+ 3], 22, -1044525330);a = md5_ff(a, b, c, d, x[i+ 4], 7 , -176418897);d = md5_ff(d, a, b, c, x[i+ 5], 12,  1200080426);c = md5_ff(c, d, a, b, x[i+ 6], 17, -1473231341);b = md5_ff(b, c, d, a, x[i+ 7], 22, -45705983);a = md5_ff(a, b, c, d, x[i+ 8], 7 ,  1770035416);d = md5_ff(d, a, b, c, x[i+ 9], 12, -1958414417);c = md5_ff(c, d, a, b, x[i+10], 17, -42063);b = md5_ff(b, c, d, a, x[i+11], 22, -1990404162);a = md5_ff(a, b, c, d, x[i+12], 7 ,  1804603682);d = md5_ff(d, a, b, c, x[i+13], 12, -40341101);c = md5_ff(c, d, a, b, x[i+14], 17, -1502002290);b = md5_ff(b, c, d, a, x[i+15], 22,  1236535329);a = md5_gg(a, b, c, d, x[i+ 1], 5 , -165796510);d = md5_gg(d, a, b, c, x[i+ 6], 9 , -1069501632);c = md5_gg(c, d, a, b, x[i+11], 14,  643717713);b = md5_gg(b, c, d, a, x[i+ 0], 20, -373897302);a = md5_gg(a, b, c, d, x[i+ 5], 5 , -701558691);d = md5_gg(d, a, b, c, x[i+10], 9 ,  38016083);c = md5_gg(c, d, a, b, x[i+15], 14, -660478335);b = md5_gg(b, c, d, a, x[i+ 4], 20, -405537848);a = md5_gg(a, b, c, d, x[i+ 9], 5 ,  568446438);d = md5_gg(d, a, b, c, x[i+14], 9 , -1019803690);c = md5_gg(c, d, a, b, x[i+ 3], 14, -187363961);b = md5_gg(b, c, d, a, x[i+ 8], 20,  1163531501);a = md5_gg(a, b, c, d, x[i+13], 5 , -1444681467);d = md5_gg(d, a, b, c, x[i+ 2], 9 , -51403784);c = md5_gg(c, d, a, b, x[i+ 7], 14,  1735328473);b = md5_gg(b, c, d, a, x[i+12], 20, -1926607734);a = md5_hh(a, b, c, d, x[i+ 5], 4 , -378558);d = md5_hh(d, a, b, c, x[i+ 8], 11, -2022574463);c = md5_hh(c, d, a, b, x[i+11], 16,  1839030562);b = md5_hh(b, c, d, a, x[i+14], 23, -35309556);a = md5_hh(a, b, c, d, x[i+ 1], 4 , -1530992060);d = md5_hh(d, a, b, c, x[i+ 4], 11,  1272893353);c = md5_hh(c, d, a, b, x[i+ 7], 16, -155497632);b = md5_hh(b, c, d, a, x[i+10], 23, -1094730640);a = md5_hh(a, b, c, d, x[i+13], 4 ,  681279174);d = md5_hh(d, a, b, c, x[i+ 0], 11, -358537222);c = md5_hh(c, d, a, b, x[i+ 3], 16, -722521979);b = md5_hh(b, c, d, a, x[i+ 6], 23,  76029189);a = md5_hh(a, b, c, d, x[i+ 9], 4 , -640364487);d = md5_hh(d, a, b, c, x[i+12], 11, -421815835);c = md5_hh(c, d, a, b, x[i+15], 16,  530742520);b = md5_hh(b, c, d, a, x[i+ 2], 23, -995338651);a = md5_ii(a, b, c, d, x[i+ 0], 6 , -198630844);d = md5_ii(d, a, b, c, x[i+ 7], 10,  1126891415);c = md5_ii(c, d, a, b, x[i+14], 15, -1416354905);b = md5_ii(b, c, d, a, x[i+ 5], 21, -57434055);a = md5_ii(a, b, c, d, x[i+12], 6 ,  1700485571);d = md5_ii(d, a, b, c, x[i+ 3], 10, -1894986606);c = md5_ii(c, d, a, b, x[i+10], 15, -1051523);b = md5_ii(b, c, d, a, x[i+ 1], 21, -2054922799);a = md5_ii(a, b, c, d, x[i+ 8], 6 ,  1873313359);d = md5_ii(d, a, b, c, x[i+15], 10, -30611744);c = md5_ii(c, d, a, b, x[i+ 6], 15, -1560198380);b = md5_ii(b, c, d, a, x[i+13], 21,  1309151649);a = md5_ii(a, b, c, d, x[i+ 4], 6 , -145523070);d = md5_ii(d, a, b, c, x[i+11], 10, -1120210379);c = md5_ii(c, d, a, b, x[i+ 2], 15,  718787259);b = md5_ii(b, c, d, a, x[i+ 9], 21, -343485551);a = safe_add(a, olda);b = safe_add(b, oldb);c = safe_add(c, oldc);d = safe_add(d, oldd);}return Array(a, b, c, d);}function md5_cmn(q, a, b, x, s, t){return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s),b);}function md5_ff(a, b, c, d, x, s, t){return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);}function md5_gg(a, b, c, d, x, s, t){return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);}function md5_hh(a, b, c, d, x, s, t){return md5_cmn(b ^ c ^ d, a, b, x, s, t);}function md5_ii(a, b, c, d, x, s, t){return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);}function safe_add(x, y){var lsw = (x & 0xFFFF) + (y & 0xFFFF);var msw = (x >> 16) + (y >> 16) + (lsw >> 16);return (msw << 16) | (lsw & 0xFFFF);}function bit_rol(num, cnt){return (num << cnt) | (num >>> (32 - cnt));}function str2binl(str){var bin = Array();var mask = (1 << chrsz) - 1;for(var i = 0; i < str.length * chrsz; i += chrsz)bin[i>>5] |= (str.charCodeAt(i / chrsz) & mask) << (i%32);return bin;}function binl2hex(binarray){var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";var str = "";for(var i = 0; i < binarray.length * 4; i++){str += hex_tab.charAt((binarray[i>>2] >> ((i%4)*8+4)) & 0xF) +hex_tab.charAt((binarray[i>>2] >> ((i%4)*8  )) & 0xF);}return str;}


/*

 
 25 0,6-23/2 * * * jd_summer_movement.js

  */
const $ = new Env('燃动夏季');
const notify = $.isNode() ? require('./sendNotify') : '';
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
const helpAuthorFlag = true;//是否助力作者SH  true 助力，false 不助力
const https = require('https');
const fs = require('fs/promises');
const { R_OK } = require('fs').constants;
const vm = require('vm');
const URL = 'https://wbbny.m.jd.com/babelDiy/Zeus/2rtpffK8wqNyPBH6wyUDuBKoAbCt/index.html';
const SYNTAX_MODULE = '!function(n){var r={};function o(e){if(r[e])';
const REG_SCRIPT = /<script type="text\/javascript" src="([^><]+\/(app\.\w+\.js))\">/gm;
const REG_ENTRY = /(__webpack_require__\(__webpack_require__.s=)(\d+)(?=\)})/;
const needModuleId = 356
const DATA = {appid:'50085',sceneid:'OY217hPageh5'};
let smashUtils;
const UA =  `jdpingou;iPhone;10.0.6;${Math.ceil(Math.random()*2+12)}.${Math.ceil(Math.random()*4)};${randomString(40)};`;
class MovementFaker {
  constructor(cookie) {this.cookie = cookie;this.ua = UA;}
  async run() {if (!smashUtils) {await this.init();}
    var t = Math.floor(1e7 + 9e7 * Math.random()).toString();
    var e = smashUtils.get_risk_result({id: t,data: {random: t}}).log;
    var o = JSON.stringify({extraData: {log:  e || -1,sceneid: DATA.sceneid,},random: t});
    return o;
  }
  async init() {
    try {
      console.time('MovementFaker');process.chdir(__dirname);const html = await MovementFaker.httpGet(URL);const script = REG_SCRIPT.exec(html);
      if (script) {const [, scriptUrl, filename] = script;const jsContent = await this.getJSContent(filename, scriptUrl);const fnMock = new Function;const ctx = {window: { addEventListener: fnMock },document: {addEventListener: fnMock,removeEventListener: fnMock,cookie: this.cookie,},navigator: { userAgent: this.ua },};vm.createContext(ctx);vm.runInContext(jsContent, ctx);smashUtils = ctx.window.smashUtils;smashUtils.init(DATA);
      }
      console.timeEnd('MovementFaker');
    } catch (e) {
      console.log(e)
    }
  }
  async getJSContent(cacheKey, url) {
    try {await fs.access(cacheKey, R_OK);const rawFile = await fs.readFile(cacheKey, { encoding: 'utf8' });return rawFile;
    } catch (e) {
      let jsContent = await MovementFaker.httpGet(url);
      const moduleIndex = jsContent.indexOf(SYNTAX_MODULE, 1);
      const findEntry = REG_ENTRY.test(jsContent);
      if (!(moduleIndex && findEntry)) {
        throw new Error('Module not found.');
      }
      jsContent = jsContent.replace(REG_ENTRY, `$1${needModuleId}`);
      fs.writeFile(cacheKey, jsContent);
      return jsContent;
      REG_ENTRY.lastIndex = 0;
      const entry = REG_ENTRY.exec(jsContent);
    }
  }
  static httpGet(url) {
    return new Promise((resolve, reject) => {
      const protocol = url.indexOf('http') !== 0 ? 'https:' : '';
      const req = https.get(protocol + url, (res) => {res.setEncoding('utf-8');let rawData = '';res.on('error', reject);res.on('data', chunk => rawData += chunk);res.on('end', () => resolve(rawData));});
      req.on('error', reject);
      req.end();
    });
  }
}

$.inviteList = [];
$.byInviteList = [];
let uuid = 8888;
let cookiesArr = [];
if ($.isNode()) {
  Object.keys(jdCookieNode).forEach((item) => {
    cookiesArr.push(jdCookieNode[item])
  })
  if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {};
} else {
  cookiesArr = [
    $.getdata("CookieJD"),
    $.getdata("CookieJD2"),
    ...$.toObj($.getdata("CookiesJD") || "[]").map((item) => item.cookie)].filter((item) => !!item);
}

!(async () => {
  if (!cookiesArr[0]) {
    $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
    return;
  }


  console.log(`注意：若执行失败，则请进入环境手动删除“app.5c2472d1.js”文件，然后重新执行脚本`);
  console.log(`若找不到“app.5c2472d1.js”文件，则删除“app”开头的解密文件`);
  // try{
  //   nods(process.cwd());
  // }catch (e) {
  //
  // }

  for (let i = 0; i < cookiesArr.length; i++) {
    if (cookiesArr[i]) {
      $.cookie = cookiesArr[i];
      uuid = getUUID();
      $.UserName = decodeURIComponent($.cookie.match(/pt_pin=([^; ]+)(?=;?)/) && $.cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1]);
      $.index = i + 1;
      $.isLogin = true;
      $.nickName = $.UserName;
      await TotalBean();
      console.log(`\n*****开始【京东账号${$.index}】${$.nickName || $.UserName}*****\n`);
      console.log(`\n如有未完成的任务，请多执行几次\n`);
      if (!$.isLogin) {
        $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
        if ($.isNode()) {
          await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
        }
        continue
      }
      try {
        await main();
      }catch (e) {
        console.log(JSON.stringify(e));
        console.log(JSON.stringify(e.message));
      }
    }
  }

  let res = [],res2 = [];
  if(helpAuthorFlag){
    try{
      res = await getAuthorShareCode('http://cdn.trueorfalse.top/392b03aabdb848d0b7e5ae499ef24e35/');
      res2 = await getAuthorShareCode(`https://cdn.jsdelivr.net/gh/gitupdate/updateTeam@master/shareCodes/jd_zoo.json?${new Date()}`);
    }catch (e) {}
    if(!res){res = [];}
    if(!res2){res2 = [];}
  }
  let allCodeList = getRandomArrayElements([ ...res, ...res2],[ ...res, ...res2].length);
  allCodeList=[...$.byInviteList,...allCodeList];
  if(allCodeList.length >0){
    console.log(`\n******开始助力百元守卫战*********\n`);
    for (let i = 0; i < cookiesArr.length; i++) {
      $.cookie = cookiesArr[i];
      $.canHelp = true;
      $.UserName = decodeURIComponent($.cookie.match(/pt_pin=([^; ]+)(?=;?)/) && $.cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1]);
      for (let i = 0; i < allCodeList.length && $.canHelp; i++) {
        $.inviteId = allCodeList[i];
        console.log(`${$.UserName} 去助力 ${$.inviteId}`);
        await takePostRequest('byHelp');
        await $.wait(1000);
      }
    }
  }
  if ($.inviteList.length > 0) console.log(`\n******开始内部京东账号【邀请好友助力】*********\n`);
  for (let i = 0; i < cookiesArr.length; i++) {
    $.cookie = cookiesArr[i];
    $.canHelp = true;
    $.UserName = decodeURIComponent($.cookie.match(/pt_pin=([^; ]+)(?=;?)/) && $.cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1]);
    $.index = i + 1;
    for (let j = 0; j < $.inviteList.length && $.canHelp; j++) {
      $.oneInviteInfo = $.inviteList[j];
      if ($.oneInviteInfo.ues === $.UserName || $.oneInviteInfo.max) {
        continue;
      }
      $.inviteId = $.oneInviteInfo.inviteId;
      console.log(`${$.UserName}去助力${$.oneInviteInfo.ues},助力码${$.inviteId}`);
      await takePostRequest('help');
      await $.wait(2000);
    }
  }
  try{
    nods(process.cwd());
  }catch (e) {

  }
})().catch((e) => {$.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')}).finally(() => {$.done();})
function randomString(e) {
  e = e || 32;
  let t = "abcdefhijkmnprstwxyz2345678", a = t.length, n = "";
  for (i = 0; i < e; i++)
    n += t.charAt(Math.floor(Math.random() * a));
  return n
}

async function main(){
  $.homeData = {};
  $.taskList = [];
  await takePostRequest('olympicgames_home');
  $.userInfo =$.homeData.result.userActBaseInfo
  console.log(`\n待兑换金额：${Number($.userInfo.poolMoney)} 当前等级:${$.userInfo.medalLevel} \n`);
  await $.wait(1000);
  if($.userInfo &&  $.userInfo.sex !== 1 && $.userInfo.sex !== 0){
    await takePostRequest('olympicgames_tiroGuide');
    await $.wait(1000);
  }
  console.log('获取百元守卫战信息')
  $.guradHome = {};
  await takePostRequest('olypicgames_guradHome');
  await $.wait(2000);
  if (Number($.userInfo.poolCurrency) >= Number($.userInfo.exchangeThreshold)) {
    console.log(`满足升级条件，去升级`);
    await $.wait(1000);
    await takePostRequest('olympicgames_receiveCash');
  }
  if($.homeData.result.trainingInfo.state === 0 && !$.homeData.result.trainingInfo.finishFlag){
    console.log(`开始运动`)
    await takePostRequest('olympicgames_startTraining');
  }else if($.homeData.result.trainingInfo.state === 0 && $.homeData.result.trainingInfo.finishFlag){
    console.log(`已完成今日运动`)
  }
  bubbleInfos = $.homeData.result.bubbleInfos;
  let runFlag = false;
  for(let item of bubbleInfos){
    if(item.type != 7){
      $.collectId = item.type
      await takePostRequest('olympicgames_collectCurrency');
      await $.wait(1000);
      runFlag = true;
    }
  }
  if(runFlag) {
    await takePostRequest('olympicgames_home');
    $.userInfo =$.homeData.result.userActBaseInfo;
  }
  if (runFlag && Number($.userInfo.poolCurrency) >= Number($.userInfo.exchangeThreshold)) {
    console.log(`满足升级条件，去升级`);
    await $.wait(1000);
    await takePostRequest('olympicgames_receiveCash');
  }
  await $.wait(1000);
  await takePostRequest('olympicgames_getTaskDetail');
  await $.wait(1000);
  console.log(`开始做任务`)
  await doTask();
  await $.wait(1000);
  console.log(`开始做微信端任务`)
  await takePostRequest('wxTaskDetail');
  await $.wait(1000)
  await doTask();

}

async function getBody($) {const zf = new MovementFaker($.cookie);const ss = await zf.run();return ss;}

async function doTask(){
  //做任务
  for (let i = 0; i < $.taskList.length; i++) {
    $.oneTask = $.taskList[i];
    if ([1, 3, 5, 7, 9, 26].includes($.oneTask.taskType) && $.oneTask.status === 1) {
      $.activityInfoList = $.oneTask.shoppingActivityVos || $.oneTask.brandMemberVos || $.oneTask.followShopVo || $.oneTask.browseShopVo;
      for (let j = 0; j < $.activityInfoList.length; j++) {
        $.oneActivityInfo = $.activityInfoList[j];
        if ($.oneActivityInfo.status !== 1 || !$.oneActivityInfo.taskToken) {
          continue;
        }
        $.callbackInfo = {};
        console.log(`做任务：${$.oneActivityInfo.title || $.oneActivityInfo.taskName || $.oneActivityInfo.shopName};等待完成`);
        await takePostRequest('olympicgames_doTaskDetail');
        if ($.callbackInfo.code === 0 && $.callbackInfo.data && $.callbackInfo.data.result && $.callbackInfo.data.result.taskToken) {
          console.log(`等待8秒`);
          await $.wait(8000);
          let sendInfo = encodeURIComponent(`{"dataSource":"newshortAward","method":"getTaskAward","reqParams":"{\\"taskToken\\":\\"${$.callbackInfo.data.result.taskToken}\\"}","sdkVersion":"1.0.0","clientLanguage":"zh"}`)
          await callbackResult(sendInfo)
        } else if ($.oneTask.taskType === 5 || $.oneTask.taskType === 3 || $.oneTask.taskType === 26) {
          await $.wait(2000);
          console.log(`任务完成`);
        } else {
          console.log($.callbackInfo);
          console.log(`任务失败`);
          await $.wait(3000);
        }
      }
    } else if ($.oneTask.taskType === 2 && $.oneTask.status === 1 && $.oneTask.scoreRuleVos[0].scoreRuleType === 2){
      console.log(`做任务：${$.oneTask.taskName};等待完成 (实际不会添加到购物车)`);
      $.taskId = $.oneTask.taskId;
      $.feedDetailInfo = {};
      await takePostRequest('olympicgames_getFeedDetail');
      let productList = $.feedDetailInfo.productInfoVos;
      let needTime = Number($.feedDetailInfo.maxTimes) - Number($.feedDetailInfo.times);
      for (let j = 0; j < productList.length && needTime > 0; j++) {
        if(productList[j].status !== 1){
          continue;
        }
        $.taskToken = productList[j].taskToken;
        console.log(`加购：${productList[j].skuName}`);
        await takePostRequest('add_car');
        await $.wait(1500);
        needTime --;
      }
    }else if ($.oneTask.taskType === 2 && $.oneTask.status === 1 && $.oneTask.scoreRuleVos[0].scoreRuleType === 0){
      $.activityInfoList = $.oneTask.productInfoVos ;
      for (let j = 0; j < $.activityInfoList.length; j++) {
        $.oneActivityInfo = $.activityInfoList[j];
        if ($.oneActivityInfo.status !== 1 || !$.oneActivityInfo.taskToken) {
          continue;
        }
        $.callbackInfo = {};
        console.log(`做任务：浏览${$.oneActivityInfo.skuName};等待完成`);
        await takePostRequest('olympicgames_doTaskDetail');
        if ($.oneTask.taskType === 2) {
          await $.wait(2000);
          console.log(`任务完成`);
        } else {
          console.log($.callbackInfo);
          console.log(`任务失败`);
          await $.wait(3000);
        }
      }
    }else if($.oneTask.status !== 1){
      console.log(`任务：${$.oneTask.taskName}，已完成`);
    }else{
      console.log(`任务：${$.oneTask.taskName}，不执行`);
    }
  }
}

async function takePostRequest(type) {
  let body = ``;
  let myRequest = ``;
  switch (type) {
    case 'olympicgames_home':
      body = `functionId=olympicgames_home&body={}&client=wh5&clientVersion=1.0.0&uuid=${uuid}&appid=o2_act`;
      myRequest = await getPostRequest(body);
      break;
    case 'olympicgames_receiveCash':
      body = `functionId=olympicgames_receiveCash&body={"type":6}&client=wh5&clientVersion=1.0.0&uuid=${uuid}&appid=o2_act`;
      myRequest = await getPostRequest(body);
      break
    case 'olympicgames_getTaskDetail':
      body = `functionId=olympicgames_getTaskDetail&body={"taskId":"","appSign":"1"}&client=wh5&clientVersion=1.0.0&uuid=${uuid}&appid=o2_act`;
      myRequest = await getPostRequest(body);
      break
    case 'olympicgames_doTaskDetail':
      body = await getPostBody(type);
      myRequest = await getPostRequest(body);
      break;
    case 'olympicgames_getFeedDetail':
      body = `functionId=olympicgames_getFeedDetail&body={"taskId":"${$.taskId}"}&client=wh5&clientVersion=1.0.0&uuid=${uuid}&appid=o2_act`;
      myRequest = await getPostRequest(body);
      break;
    case 'wxTaskDetail':
      body = `functionId=olympicgames_getTaskDetail&body={"taskId":"","appSign":"2"}&client=wh5&clientVersion=1.0.0&uuid=${uuid}&appid=o2_act`;
      myRequest = await getPostRequest(body);
      break
    case 'olympicgames_collectCurrency':
      body = await getPostBody(type);
      myRequest = await getPostRequest(body);
      break
    case 'add_car':
      body = await getPostBody(type);
      myRequest = await getPostRequest(body);
      break;
    case 'help':
    case 'byHelp':
      body = await getPostBody(type);
      myRequest = await getPostRequest( body);
      break;
    case 'olympicgames_startTraining':
      body = await getPostBody(type);
      myRequest = await getPostRequest( body);
      break;
    case 'olypicgames_guradHome':
      body = `functionId=olypicgames_guradHome&body={}&client=wh5&clientVersion=1.0.0&uuid=${uuid}&appid=o2_act`;
      myRequest = await getPostRequest( body);
      break
    case 'olympicgames_tiroGuide':
      body = `functionId=olympicgames_tiroGuide&body={"sex":1,"sportsGoal":2}&client=wh5&clientVersion=1.0.0&uuid=${uuid}&appid=${$.appid}`;
      myRequest = await getPostRequest(body);
      break;
    default:
      console.log(`错误${type}`);
  }
  if( type === 'add_car' ){
    myRequest['url'] = `https://api.m.jd.com/client.action?advId=olympicgames_doTaskDetail`;
  }else if( type === 'help' ||  type === 'byHelp'){
    myRequest['url'] = `https://api.m.jd.com/client.action?advId=olympicgames_assist`;
  }else if( type === 'wxTaskDetail'){
    myRequest['url'] = `https://api.m.jd.com/client.action?advId=olympicgames_getTaskDetail`;
  }else{
    myRequest['url'] = `https://api.m.jd.com/client.action?advId=${type}`;
  }
  return new Promise(async resolve => {
    $.post(myRequest, (err, resp, data) => {
      try {
        //console.log(data);
        dealReturn(type, data);
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}

async function dealReturn(type, data) {
  try {
    data = JSON.parse(data);
  } catch (e) {
    console.log(`返回异常：${data}`);
    return;
  }
  switch (type) {
    case 'olympicgames_home':
      if (data.code === 0) {
        if (data.data['bizCode'] === 0) {
          $.homeData = data.data;
        }
      }
      break;
    case 'olympicgames_receiveCash':
      if (data.code === 0 && data.data && data.data.result) {
        console.log('升级成功')
        // if(data.data.result.couponVO){
        //   let res = data.data.result.couponVO
        //   console.log(`获得[${res.couponName}]优惠券：${res.usageThreshold} 优惠：${res.quota} 时间：${res.useTimeRange}`);
        // }
      }else{
        //console.log(JSON.stringify(data));
      }
      console.log(JSON.stringify(data));
      break;
    case 'olympicgames_getTaskDetail':
      if (data.code === 0 && data.data.result) {
        console.log(`互助码：${data.data.result.inviteId || '助力已满，获取助力码失败'}`);
        if (data.data.result.inviteId) {
          $.inviteList.push({
            'ues': $.UserName,
            'inviteId': data.data.result.inviteId,
            'max': false
          });
        }
        $.taskList =  data.data.result.taskVos || [];
      }else{
        console.log(JSON.stringify(data));
      }
      break;
    case 'wxTaskDetail':
      if (data.code === 0 && data.data.result) {
        $.taskList =  data.data.result.taskVos || [];
      }else{
        console.log(JSON.stringify(data));
      }
      break;
    case 'olympicgames_getFeedDetail':
      if (data.code === 0) {
        $.feedDetailInfo = data.data.result.addProductVos[0] || [];
      }
      break;
    case 'olympicgames_doTaskDetail':
      $.callbackInfo = data;
      break;
    case 'add_car':
      if (data.code === 0) {
        if(data.data && data.data.result && data.data.result.acquiredScore){
          let acquiredScore = data.data.result.acquiredScore;
          if(Number(acquiredScore) > 0){
            console.log(`加购成功,获得金币:${acquiredScore}`);
          }else{
            console.log(`加购成功`);
          }
        }else{
          console.log(JSON.stringify(data));
        }
      }else{
        console.log(`加购失败`);
        console.log(JSON.stringify(data));
      }
      break
    case 'help':
    case 'byHelp':
      if(data.data && data.data.bizCode === 0){
        if(data.data.result.hongBaoVO && data.data.result.hongBaoVO.withdrawCash){
          console.log(`助力成功`);
        }
      }else if(data.data && data.data.bizMsg){
        if(data.data.bizCode === -405 || data.data.bizCode === -411){
          $.canHelp = false;
        }
        if(data.data.bizCode === -404 && $.oneInviteInfo){
          $.oneInviteInfo.max = true;
        }
        console.log(data.data.bizMsg);
      }else{
        console.log(JSON.stringify(data));
      }
      //console.log(`助力结果\n${JSON.stringify(data)}`)
      break;
    case 'olympicgames_collectCurrency':
      if (data.code === 0 && data.data && data.data.result) {
        console.log(`收取成功，获得：${data.data.result.poolCurrency}`);
      }else{
        console.log(JSON.stringify(data));
      }
      break;
    case 'olympicgames_startTraining':
      if (data.code === 0 && data.data && data.data.result) {
        console.log(`执行运动成功`);
      }else{
        console.log(JSON.stringify(data));
      }
      break;
    case 'olypicgames_guradHome':
      //console.log(JSON.stringify(data));
      if (data.data && data.data.result && data.data.bizCode === 0) {
        console.log(`百元守卫战互助码：${ data.data.result.inviteId || '助力已满，获取助力码失败'}`);
        $.guradHome = data.data;
        if(data.data.result.inviteId && Number(data.data.result.activityLeftSeconds)> 0){
          $.byInviteList.push(data.data.result.inviteId)
        }else if(Number(data.data.result.activityLeftSeconds) === 0){
          console.log(`百元守卫时间已结束`);
        }
      }else if (data.data && data.data.bizCode === 1103) {
        console.log(`百元守卫时间已结束,已领取奖励`);
      }else {
        console.log(JSON.stringify(data));
      }
      break;
    case 'olympicgames_tiroGuide':
      console.log(JSON.stringify(data));
      break
    default:
      console.log(`未判断的异常${type}`);
  }
}
//领取奖励
function callbackResult(info) {
  return new Promise((resolve) => {
    let url = {
      url: `https://api.m.jd.com/?functionId=qryViewkitCallbackResult&client=wh5&clientVersion=1.0.0&body=${info}&_timestamp=` + Date.now(),
      headers: {
        'Origin': `https://bunearth.m.jd.com`,
        'Cookie': $.cookie,
        'Connection': `keep-alive`,
        'Accept': `*/*`,
        'Host': `api.m.jd.com`,
        'User-Agent': UA,
          //$.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
        'Accept-Encoding': `gzip, deflate, br`,
        'Accept-Language': `zh-cn`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Referer': 'https://bunearth.m.jd.com'
      }
    }

    $.get(url, async (err, resp, data) => {
      try {
        data = JSON.parse(data);
        console.log(data.toast.subTitle)
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve()
      }
    })
  })
}

async function getPostRequest(body) {
  const method = `POST`;
  const headers = {
    "Accept": "application/json",
    "Accept-Encoding": "gzip, deflgetPostRequestate, br",
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
    "Connection": "keep-alive",
    "Content-Type": "application/x-www-form-urlencoded",
    'Cookie': $.cookie,
    "Origin": "https://wbbny.m.jd.com",
    "Referer": "https://wbbny.m.jd.com/",
    'User-Agent': UA,
    //'User-Agent': $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
  };
  return { method: method, headers: headers, body: body};
}

async function getPostBody(type) {
  return new Promise(async resolve => {
    let taskBody = '';
    try {
      const log = await getBody($);
      if (type === 'help' || type === 'byHelp') {
        taskBody = `functionId=olympicgames_assist&body=${JSON.stringify({"inviteId":$.inviteId,"type": "confirm","ss" :log})}&client=wh5&clientVersion=1.0.0&uuid=${uuid}&appid=o2_act`
      } else if (type === 'olympicgames_collectCurrency') {
        taskBody = `functionId=olympicgames_collectCurrency&body=${JSON.stringify({"type":$.collectId,"ss" : log})}&client=wh5&clientVersion=1.0.0&uuid=${uuid}&appid=o2_act`;
      } else if(type === 'add_car'){
        taskBody = `functionId=olympicgames_doTaskDetail&body=${JSON.stringify({"taskId": $.taskId,"taskToken":$.taskToken,"ss" : log})}&client=wh5&clientVersion=1.0.0&uuid=${uuid}&appid=o2_act`
      }else if(type === 'olympicgames_startTraining'){
        taskBody = `functionId=olympicgames_startTraining&body=${JSON.stringify({"ss" : log})}&client=wh5&clientVersion=1.0.0&uuid=${uuid}&appid=o2_act`
      }else{
        taskBody = `functionId=${type}&body=${JSON.stringify({"taskId": $.oneTask.taskId,"actionType":1,"taskToken" : $.oneActivityInfo.taskToken,"ss" : log})}&client=wh5&clientVersion=1.0.0&uuid=${uuid}&appid=o2_act`
      }
      //console.log(taskBody)
    } catch (e) {
      $.logErr(e)
    } finally {
      resolve(taskBody);
    }
  })
}
function getUUID() {
  var n = (new Date).getTime();
  let uuid="xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"
  uuid = uuid.replace(/[xy]/g, function (e) {
    var t = (n + 16 * Math.random()) % 16 | 0;
    return n = Math.floor(n / 16),
      ("x" == e ? t : 3 & t | 8).toString(16)
  }).replace(/-/g, "")
  return uuid
}
/**
 * 随机从一数组里面取
 * @param arr
 * @param count
 * @returns {Buffer}
 */
function getRandomArrayElements(arr, count) {
  var shuffled = arr.slice(0), i = arr.length, min = i - count, temp, index;
  while (i-- > min) {
    index = Math.floor((i + 1) * Math.random());
    temp = shuffled[index];
    shuffled[index] = shuffled[i];
    shuffled[i] = temp;
  }
  return shuffled.slice(min);
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

function TotalBean() {
  return new Promise(async resolve => {
    const options = {
      url: "https://me-api.jd.com/user_new/info/GetJDUserInfoUnion",
      headers: {
        Host: "me-api.jd.com",
        Accept: "*/*",
        Connection: "keep-alive",
        Cookie: $.cookie,
        "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
        "Accept-Language": "zh-cn",
        "Referer": "https://home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&",
        "Accept-Encoding": "gzip, deflate, br"
      }
    }
    $.get(options, (err, resp, data) => {
      try {
        if (err) {
          $.logErr(err)
        } else {
          if (data) {
            data = JSON.parse(data);
            if (data['retcode'] === "1001") {
              $.isLogin = false; //cookie过期
              return;
            }
            if (data['retcode'] === "0" && data.data && data.data.hasOwnProperty("userInfo")) {
              $.nickName = data.data.userInfo.baseInfo.nickname;
            }
          } else {
            $.log('京东服务器返回空数据');
          }
        }
      } catch (e) {
        $.logErr(e)
      } finally {
        resolve();
      }
    })
  })
}
function nods(dir) {
  try {
    const fs = require('fs');
    const stat = fs.stat;
    const path = require('path');
    if (fs.existsSync(dir)) {
      fs.readdir(dir, function(err, files) {
        files.forEach(function(filename) {
          const src = path.join(dir, filename)
          stat(src, function (err, st) {
            if (err) { throw err; }
            // 判断是否为文件
            if (st.isFile()) {
              if (/^app\.[0-9a-z]+\.js/.test(filename)) {
                fs.unlink(src, (err) => {
                  if (err) throw err;
                  console.log('成功删除文件: ' + src);
                });
              }
            } else {
              // 递归作为文件夹处理
              nods(src);
            }
          });
        });
      });
    } else {
      console.log("给定的路径不存在，请给出正确的路径");
    }
  } catch (e) {
    console.log(e)
  }
}
// prettier-ignore
function Env(t,e){"undefined"!=typeof process&&JSON.stringify(process.env).indexOf("GITHUB")>-1&&process.exit(0);class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}



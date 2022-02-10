/*

#自定义邀请码变量 
export joyinviterPin="" //IANWqUmbgQVF9ePHGsGFA2m-zSTLKmHFbE-IW-Waarw

5 * * * * jd_joy-park.js

*/



const $ = new Env('柠檬旺财乐园新手上路版');
const notify = $.isNode() ? require('./sendNotify') : '';
//Node.js用户请在jdCookie.js处填写京东ck;
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';

//IOS等用户直接用NobyDa的jd cookie
let cookiesArr = [], cookie = '', message;

let codeList = []
let codeList1 = []

let joyinviterPin = '';
if (process.env.joyinviterPin) {
  joyinviterPin = process.env.joyinviterPin;
}



if ($.isNode()) {
  Object.keys(jdCookieNode).forEach((item) => {
    cookiesArr.push(jdCookieNode[item])
  })
  if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {};
} else {
  cookiesArr = [$.getdata('CookieJD'), $.getdata('CookieJD2'), ...jsonParse($.getdata('CookiesJD') || "[]").map(item => item.cookie)].filter(item => !!item);
}
const JD_API_HOST = 'https://api.m.jd.com/client.action';

!(async () => {
  if (!cookiesArr[0]) {
    $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
    return;
  }

  for (let i = 0; i < cookiesArr.length; i++) {
    if (cookiesArr[i]) {
      cookie = cookiesArr[i];
      ck2 = cookiesArr[Math.round(Math.random()*3)];
      $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])
      $.index = i + 1;
      $.isLogin = true;
      $.nickName = '';
      message = '';
      await TotalBean();
      console.log(`\n******开始【京东账号${$.index}】${$.nickName || $.UserName}*********\n`);
      if (!$.isLogin) {
        $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});

        if ($.isNode()) {
          await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
        }
        continue
      }
     
      
      await joyBaseInfo()
      await joyList()
      //await joyBuy()
      await tasklist()

    }
  }
})()
  .catch((e) => {
    $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
  })
  .finally(() => {
    $.done();
  })
function joyBaseInfo() {
    return new Promise(async (resolve) => {

                let options = {
    url: `https://api.m.jd.com/`,

    body: `functionId=joyBaseInfo&body={"taskId":"","inviteType":"","inviterPin":"","linkId":"LsQNxL7iWDlXUs6cFl-AAg"}&_t=1625484389026&appid=activities_platform`,
headers: {
"Origin": "https://joypark.jd.com",
"Host": "api.m.jd.com",
"User-Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.116 UBrowser/5.6.12150.8 Safari/537.36",
      "Cookie": cookie,
      }
                }
      
        $.post(options, async (err, resp, data) => {
            try {

                    data = JSON.parse(data);

                    
                    
                    if(data.errMsg == "success"){
                      dj = data.data.level
                      gmdj = data.data.fastBuyLevel
                      jb = data.data.joyCoin
                      yqm = data.data.invitePin
                      $.log(`\n===================================`)
                      $.log(`🐶旺财等级:${dj}\n🐶购买旺财等级:${gmdj}\n🐶当前金币:${jb}\n🐶邀请码:${yqm}\n===================================\n`)

                     }else  if(data.errMsg == "操作失败"){
                
                    console.log("操作失败")
                
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve();
            }
        });
    });
}
function joyList() {
    return new Promise(async (resolve) => {

                let options = {
    url: `https://api.m.jd.com/?functionId=joyList&body={%22linkId%22:%22LsQNxL7iWDlXUs6cFl-AAg%22}&_t=1625484389027&appid=activities_platform`,


headers: {
"Origin": "https://joypark.jd.com",
"Host": "api.m.jd.com",
"User-Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.116 UBrowser/5.6.12150.8 Safari/537.36",
      "Cookie": cookie,
      }
                }
      
        $.get(options, async (err, resp, data) => {
            try {

                    data = JSON.parse(data);

                    
                    
                    if(data.errMsg == "success"){
                      joyNumber = data.data.joyNumber
                      $.log(`\n===================================`)
                      $.log(`总共养了:${joyNumber}🐶只旺财\n===================================\n`)
                      $.log(`可购买：${10-joyNumber}`)
                      if(joyNumber !==10){
                      for(let k = 0; k < 10-joyNumber; k++){
                      await joyBuy()  
                      }}
                      workJoyInfoList = data.data.workJoyInfoList
                      for(let i = 0; i < workJoyInfoList.length; i++){
                      
                      location=workJoyInfoList[i].location
                      unlock=workJoyInfoList[i].unlock
                      if(unlock==true){
                      $.log(`${location}号地 此地已开`)     
                      }else if(unlock==false){
                       $.log(`${location}号地 此地未开 快去邀请好友开采`)   
                      }
                      joyDTO=workJoyInfoList[i].joyDTO
                      if(joyDTO !== null){
                      doid=workJoyInfoList[i].joyDTO.id
                      dolevel=workJoyInfoList[i].joyDTO.level
                      doname=workJoyInfoList[i].joyDTO.name
                      $.log(`🐶正在挖土的旺财:${doname}\n🐶等级:${dolevel}\n🐶旺财ID:${doid}\n===================================\n`)
                      }else if(joyDTO == null){
                      
                        $.log(`🐶此地还没旺财去挖土\n`)  
                        $.log(`\n===================================`)
                      }
                      }
                      activityJoyList = data.data.activityJoyList
                      for(let k = 0; k < activityJoyList.length; k++){
                      wcid = activityJoyList[k].id
                      wcname = activityJoyList[k].name
                      wcdj = activityJoyList[k].level
                      wchs = activityJoyList[k].recoveryPrice
                      codeList[codeList.length] = wcid
                      codeList1[codeList1.length] = wcdj
                      for (l = 0; l < codeList.length && codeList1.length; l++) {
                          
                          if(codeList[l]==codeList[l]){
                           await joyMerge(codeList[1],codeList[l])
                           await joyMerge(codeList[2],codeList[l])
                           await joyMerge(codeList[3],codeList[l])
                           await joyMerge(codeList[4],codeList[l])
                           await joyMerge(codeList[5],codeList[l])
                           await joyMerge(codeList[6],codeList[l])
                           await joyMerge(codeList[7],codeList[l])
                           await joyMerge(codeList[8],codeList[l])
                           await joyMerge(codeList[9],codeList[l])
                           await joyMerge(codeList[10],codeList[l])
                           //$.log(`${codeList[l]} ${codeList1[l]}`)
                           //$.log(codeList1[l])
                      }
                          
                      }



                      $.log(`🐶旺财:${wcname}\n🐶等级:${wcdj}\n🐶旺财ID:${wcid}\n🐶回收价格:${wchs}\n===================================\n`)
                      }
                      





                }else  if(data.errMsg == "操作失败"){
                
                    console.log("操作失败")
                
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve();
            }
        });
    });
}

function joyMerge(a,b) {
    return new Promise(async (resolve) => {

                let options = {
    url: `https://api.m.jd.com/`,

    body: `functionId=joyMerge&body={"joyOneId":${a},"joyTwoId":${b},"linkId":"LsQNxL7iWDlXUs6cFl-AAg"}&_t=1625488466557&appid=activities_platform`,
headers: {
"Origin": "https://joypark.jd.com",
"Host": "api.m.jd.com",
"User-Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.116 UBrowser/5.6.12150.8 Safari/537.36",
      "Cookie": cookie,
      }
                }
      
        $.post(options, async (err, resp, data) => {
            try {

                    data = JSON.parse(data);

                    
                    
                    if(data.errMsg == "success"){
                      hcid = data.data.joyVO.id
                      hcname = data.data.joyVO.name
                      hcdj = data.data.joyVO.level
                      hchs = data.data.joyVO.recoveryPrice
                      $.log(`\n===================================`)
$.log(`🐶合成旺财:${hcname}\n🐶合成等级:${hcdj}\n🐶合成旺财ID:${hcid}\n🐶合成回收价格:${hchs}\n===================================\n`)

                }
                //else  if(data.errMsg == "操作失败"){
                
                   // console.log("操作失败")
                
                //}
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve();
            }
        });
    });
}


function joyBuy() {
    return new Promise(async (resolve) => {

                let options = {
    url: `https://api.m.jd.com/`,

    body: `functionId=joyBuy&body={"level":${gmdj},"linkId":"LsQNxL7iWDlXUs6cFl-AAg"}&_t=1625536191020&appid=activities_platform`,
headers: {
"Origin": "https://joypark.jd.com",
"Host": "api.m.jd.com",
"User-Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.116 UBrowser/5.6.12150.8 Safari/537.36",
      "Cookie": cookie,
      }
                }
      
        $.post(options, async (err, resp, data) => {
            try {

                    data = JSON.parse(data);

                    
                    
                    if(data.errMsg == "success"){
                      buyid = data.data.id
                      buyname = data.data.name
                      buydj = data.data.level
                      buyhs = data.data.recoveryPrice
                      $.log(`\n===================================`)
$.log(`🐶购买旺财:${buyname}\n🐶购买等级:${buydj}\n🐶购买旺财ID:${buyid}\n🐶购买回收价格:${buyhs}\n===================================\n`)

                }else  if(data.errMsg == "操作失败"){
                
                    console.log("操作失败")
                
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve();
            }
        });
    });
}

function tasklist() {
    return new Promise(async (resolve) => {

                let options = {
    url: `https://api.m.jd.com/`,

    body: `functionId=apTaskList&body={"linkId":"LsQNxL7iWDlXUs6cFl-AAg"}&_t=1625536971467&appid=activities_platform`,
headers: {
"Origin": "https://joypark.jd.com",
"Host": "api.m.jd.com",
"User-Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.116 UBrowser/5.6.12150.8 Safari/537.36",
      //"Cookie": cookie,
      }
                }
      
        $.post(options, async (err, resp, data) => {
            
            try {

                    data = JSON.parse(data);

                    
                    
                    if(data.success == true){
                      task = data.data
                      signtaskType = task[0].taskType
                      signtaskid = task[0].id
                     $.log(`\n===============签到===============`)
                       await dotask(signtaskType,signtaskid) 
                       await apTaskDrawAward(signtaskType,signtaskid) 
                       $.log(`\n===============浏览===============`)
                       lltaskType = task[3].taskType
                       llsigntaskid = task[3].id
                       await dotask(lltaskType,llsigntaskid,"70409858773") 
                       await apTaskDrawAward(lltaskType,llsigntaskid,"70409858773")   
                       await dotask(lltaskType,llsigntaskid,"10029398355348") 
                       await apTaskDrawAward(lltaskType,llsigntaskid,"10029398355348") 
                       await dotask(lltaskType,llsigntaskid,"10026179886685") 
                       await apTaskDrawAward(lltaskType,llsigntaskid,"10026179886685") 
                       await dotask(lltaskType,llsigntaskid,"10032911040996") 
                       await apTaskDrawAward(lltaskType,llsigntaskid,"10032911040996") 
                       await dotask(lltaskType,llsigntaskid,"10033042710323") 
                       await apTaskDrawAward(lltaskType,llsigntaskid,"10033042710323") 
                       await dotask(lltaskType,llsigntaskid,"59304295243") 
                       await apTaskDrawAward(lltaskType,llsigntaskid,"59304295243") 
                       await dotask(lltaskType,llsigntaskid,"10029677756218") 
                       await apTaskDrawAward(lltaskType,llsigntaskid,"10029677756218") 
                       await dotask(lltaskType,llsigntaskid,"10032928241364") 
                       await apTaskDrawAward(lltaskType,llsigntaskid,"10032928241364") 
                       await dotask(lltaskType,llsigntaskid,"10032992559557") 
                       await apTaskDrawAward(lltaskType,llsigntaskid,"10032992559557") 
                       await dotask(lltaskType,llsigntaskid,"10028926270219") 
                       await apTaskDrawAward(lltaskType,llsigntaskid,"10028926270219") 
                       $.log(`\n===============浏览会场===============`)
                       ll1taskType = task[2].taskType
                       ll1signtaskid = task[2].id
                       await dotask(ll1taskType,ll1signtaskid,"https://prodev.m.jd.com/jdlite/active/4SuoxWhFFp5P8SpYoMm6iFuFrXxC/index.html") 
                       await apTaskDrawAward(ll1taskType,ll1signtaskid,"https://prodev.m.jd.com/jdlite/active/4SuoxWhFFp5P8SpYoMm6iFuFrXxC/index.html") 
                       await dotask(ll1taskType,ll1signtaskid,"https://pro.m.jd.com/jdlite/active/BMvPWMK1RsN4PWh1JksQUnRCxPy/index.html") 
                       await apTaskDrawAward(ll1taskType,ll1signtaskid,"https://pro.m.jd.com/jdlite/active/BMvPWMK1RsN4PWh1JksQUnRCxPy/index.html") 
                       await dotask(ll1taskType,ll1signtaskid,"https://pro.m.jd.com/jdlite/active/3H885vA4sQj6ctYzzPVix4iiYN2P/index.html") 
                       await apTaskDrawAward(ll1taskType,ll1signtaskid,"https://pro.m.jd.com/jdlite/active/3H885vA4sQj6ctYzzPVix4iiYN2P/index.html")
                       await dotask(ll1taskType,ll1signtaskid,"https://pro.m.jd.com/jdlite/active/vN4YuYXS1mPse7yeVPRq4TNvCMR/index.html") 
                       await apTaskDrawAward(ll1taskType,ll1signtaskid,"https://pro.m.jd.com/jdlite/active/vN4YuYXS1mPse7yeVPRq4TNvCMR/index.html")
                       await dotask(ll1taskType,ll1signtaskid,"https://pro.m.jd.com/jdlite/active/4AMo3SQzbqAzJgowhXqvt8Dpo8iA/index.html") 
                       await apTaskDrawAward(ll1taskType,ll1signtaskid,"https://pro.m.jd.com/jdlite/active/4AMo3SQzbqAzJgowhXqvt8Dpo8iA/index.html")
                       $.log(`\n===============邀请任务===============`)
                       
                      
                       await inviteType()
                       await apTaskinviter()
                       
                       $.log(`\n===============开地邀请===============`)
                      
                       await openinvite()
                       //$.log(`\n===============升级奖励===============`)
                       //await levelDrawAward()
                
                    console.log("操作失败")
                
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve();
            }
        });
    });
}
function openinvite() {
    return new Promise(async (resolve) => {

                let options = {
    url: `https://api.m.jd.com/`,

    body: `functionId=joyBaseInfo&body={"taskId":"","inviteType":"2","inviterPin":"${joyinviterPin}","linkId":"LsQNxL7iWDlXUs6cFl-AAg"}&_t=1625540360946&appid=activities_platform`,
headers: {
"Origin": "https://joypark.jd.com",
"Host": "api.m.jd.com",
"User-Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.116 UBrowser/5.6.12150.8 Safari/537.36",
      "Cookie": cookie,
      }
                }
      
        $.post(options, async (err, resp, data) => {
             //$.log(data) 
            try {

                    data = JSON.parse(data);

                    
                    
                    if(data.success == true){
                      
                    
                    $.log(data.errMsg)
                        
                    
       
                }else  if(data.success == false){
                
                    console.log(data.errMsg+"或者你的CK不足")
                
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve();
            }
        });
    });
}
function inviteType() {
    return new Promise(async (resolve) => {

                let options = {
    url: `https://api.m.jd.com/`,

    body: `functionId=joyBaseInfo&body={"taskId":"167","inviteType":"1","inviterPin":"${joyinviterPin}","linkId":"LsQNxL7iWDlXUs6cFl-AAg"}&_t=1625540360946&appid=activities_platform`,
headers: {
"Origin": "https://joypark.jd.com",
"Host": "api.m.jd.com",
"User-Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.116 UBrowser/5.6.12150.8 Safari/537.36",
      "Cookie": cookie,
      }
                }
      
        $.post(options, async (err, resp, data) => {
             //$.log(data) 
            try {

                    data = JSON.parse(data);

                    
                    
                    if(data.success == true){
                      
                    
                    $.log(data.errMsg)
                        
                    
       
                }else  if(data.success == false){
                
                    console.log(data.errMsg+"或者你的CK不足")
                
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve();
            }
        });
    });
}
function levelDrawAward() {
    return new Promise(async (resolve) => {

                let options = {
    url: `https://api.m.jd.com/`,

    body: `functionId=joyBaseInfo&body={"taskId":"167","inviteType":"1","inviterPin":"${yqm}","linkId":"LsQNxL7iWDlXUs6cFl-AAg"}&_t=1625545015696&appid=activities_platform`,
headers: {
"Origin": "https://joypark.jd.com",
"Host": "api.m.jd.com",
"User-Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.116 UBrowser/5.6.12150.8 Safari/537.36",
      "Cookie": cookie,
      }
                }
      
        $.post(options, async (err, resp, data) => {
             //$.log(data) 
            try {

                    data = JSON.parse(data);

                    
                    
                    if(data.success == true){
                      
                    
                    $.log(data.errMsg)
                        
                    
       
                }else  if(data.success == false){
                
                    console.log(data.errMsg)
                
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve();
            }
        });
    });
}
function dotask(taskType,taskid,itemId) {
    return new Promise(async (resolve) => {

                let options = {
    url: `https://api.m.jd.com/`,

    body: `functionId=apDoTask&body={"taskType":"${taskType}","taskId":${taskid},"channel":4,"linkId":"LsQNxL7iWDlXUs6cFl-AAg","itemId":"${itemId}"}&_t=1625537021966&appid=activities_platform`,
headers: {
"Origin": "https://joypark.jd.com",
"Host": "api.m.jd.com",
"User-Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.116 UBrowser/5.6.12150.8 Safari/537.36",
      "Cookie": cookie,
      }
                }
      
        $.post(options, async (err, resp, data) => {
             //$.log(data) 
            try {

                    data = JSON.parse(data);

                    
                    
                    if(data.success == true){
                      
                    if(data.data.finished == true){
                        $.log("任务完成")
                    }else if(data.data.finished == false){
                    $.log(data.errMsg)
                        
                    }
       
                }else  if(data.success == false){
                
                    console.log(data.errMsg)
                
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve();
            }
        });
    });
}
//functionId=joyBaseInfo&body={"taskId":"167","inviteType":"1","inviterPin":"IANWqUmbgQVF9ePHGsGFA2m-zSTLKmHFbE-IW-Waarw","linkId":"LsQNxL7iWDlXUs6cFl-AAg"}&_t=1625543629130&appid=activities_platform
function apTaskinviter() {
    return new Promise(async (resolve) => {

                let options = {
    url: `https://api.m.jd.com/`,

    body: `functionId=joyBaseInfo&body={"taskId":"167","inviteType":"1","inviterPin":"${yqm}","linkId":"LsQNxL7iWDlXUs6cFl-AAg"}&_t=1625543629130&appid=activities_platform`,
headers: {
"Origin": "https://joypark.jd.com",
"Host": "api.m.jd.com",
"User-Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.116 UBrowser/5.6.12150.8 Safari/537.36",
      "Cookie": cookie,
      }
                }
      
        $.post(options, async (err, resp, data) => {
            try {

                    data = JSON.parse(data);

                    
                    
                    if(data.success == true){
                      data.errMsg
                      
       
                }else  if(data.success == false){
                
                    console.log(data.errMsg)
                
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve();
            }
        });
    });
}

function apTaskDrawAward(taskType,taskid) {
    return new Promise(async (resolve) => {

                let options = {
    url: `https://api.m.jd.com/`,

    body: `functionId=apTaskDrawAward&body={"taskType":"${taskType}","taskId":${taskid},"linkId":"LsQNxL7iWDlXUs6cFl-AAg"}&_t=1625537021966&appid=activities_platform`,
headers: {
"Origin": "https://joypark.jd.com",
"Host": "api.m.jd.com",
"User-Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.116 UBrowser/5.6.12150.8 Safari/537.36",
      "Cookie": cookie,
      }
                }
      
        $.post(options, async (err, resp, data) => {
            try {

                    data = JSON.parse(data);

                    
                    
                    if(data.success == true){
                      DrawAward = data.data
                      
                      DrawAward = DrawAward[0].awardGivenNumber
                        $.log("获得旺财币："+DrawAward)
                      
       
                }else  if(data.success == false){
                
                    console.log(data.errMsg)
                
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve();
            }
        });
    });
}









async function taskPostUrl(functionId,body) {
  return {
    url: `${JD_API_HOST}`,
    body: `functionId=${functionId}&body=${escape(JSON.stringify(body))}&client=wh5&clientVersion=1.0.0&appid=content_ecology&uuid=6898c30638c55142969304c8e2167997fa59eb54&t=1622588448365`,
    headers: {
      'Cookie': cookie,
      'Host': 'api.m.jd.com',
      'Connection': 'keep-alive',
      'Content-Type': 'application/x-www-form-urlencoded',
      "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
      'Accept-Language': 'zh-cn',
      'Accept-Encoding': 'gzip, deflate, br',
    }
  }
}


async function TotalBean() {
  return new Promise(async resolve => {
    const options = {
      "url": `https://wq.jd.com/user/info/QueryJDUserInfo?sceneval=2`,
      "headers": {
        "Accept": "application/json,text/plain, */*",
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "zh-cn",
        "Connection": "keep-alive",
        "Cookie": cookie,
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
            if (data["retcode"] === 13) {
              $.isLogin = false; //cookie过期
              return;
            }
            if (data["retcode"] === 0) {
              $.nickName = (data["base"] && data["base"].nickname) || $.UserName;
            } else {
              $.nickName = $.UserName;
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
async function safeGet(data) {
  try {
    if (typeof JSON.parse(data) == "object") {
      return true;
    }
  } catch (e) {
    console.log(e);
    console.log(`京东服务器访问数据为空，请检查自身设备网络情况`);
    return false;
  }
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

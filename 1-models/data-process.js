var isAndroid = kendo.support.mobileOS.android;


//var apiSite = (useLocalAPIs)?'http://localhost:5000':'https://charder-test-api.herokuapp.com/';
var apiSite = (useLocalAPIs)?'http://localhost:5000':'https://charder-weight-api.herokuapp.com/';

var measurementSource = new kendo.data.DataSource({
  transport: {
    read: function (data) { 取得量測記錄(measurementSource); }
  },
  sort: {
    field: "量測時間",
    dir: "desc"
  },
  requestStart: function () {
    kendo.ui.progress($("#loading"), true);
  },
  requestEnd: function () {
    kendo.ui.progress($("#loading"), false);
  },

  schema: {
    total: function () {
      console.log("measurementSource scheme total");
      //取得經緯度();    
      return 77;
    }
  },
  serverPaging: true,
  pageSize: 40,
  //group: { field: "section" }
})

async function 取得量測記錄(data) {
  console.log("取得量測記錄");

  if (!refresh) {  
    var dataTemp=[];
    data.success(dataTemp);
  } else {
    paramToSend = "?API=32" + "&UserId=" + $("#formMemberID").val(); //userId[1];
    var res = await callAPI(paramToSend, '讀取量測記錄');
    console.log(typeof res, res);
    
    var 所有量測數據=JSON.parse(res);
    console.log(所有量測數據);    
    
    var records = Object.keys(所有量測數據).sort().reverse();
    
    var dataTemp=[];    
    for (var i=0; i < records.length; i++){
      
      var 量測記錄 = 所有量測數據[records[i]];
      console.log(量測記錄.timestamp, 量測記錄.weight);
      
      var 時間Date = new Date(量測記錄.timestamp);
      var 時間Str  = 時間Date.toLocaleString();   
      console.log("時間Str", 時間Str);      
      var 卡片 = {
        "量測記錄時間": 時間Str, //所有量測數據[i].量測時間,              
        "體重":    量測記錄.weight,
        "身高":    量測記錄.height,
        "BMI":    量測記錄.BMI,        
        "量測紀錄圖片": "",              
        "url": "",
        "section": "A"             
      };
      dataTemp.push(卡片);       
    }
    
    data.success(dataTemp);    
  }
  
  if (dataTemp.length==0) {
    $("#量測記錄title").text("尚無量測記錄");
  }else {
    $("#量測記錄title").text("量測記錄");
  }
}

function nullForNow(e) {
  console.log("nullForNow");
  //currentExample = nullForNow;
}

function removeView(e) {
  //console.log("removeView", e);  
  //if (reloadCourseNeeded) {
  //  readCourses(); 
  //  reloadCourseNeeded = false;
  //}
  if (!e.view.element.data("persist")) {
    //console.log(e);
    
    // KPC: 找不到 persist 如何設定，只好用粗暴的做法
    if (e.view.id != "#forms") e.view.purge();
    
    //e.view.purge();
  }

}

//function initSearch(e) {
//  console.log("initSearch");
//  var searchBox = e.view.element.find("#demos-search");
//
//  searchBox.on("input", function () {
//    searchForCourse(searchBox.val()); //, product);
//  });
//
//  searchBox.on("blur", function () {
//    //        if (searchBox.val() == "") {
//    //            hideSearch();
//    //        }
//    searchBox.val("");
//    searchForCourse("");
//    hideSearch();
//  });
//}

var desktop = !kendo.support.mobileOS;

window.app = new kendo.mobile.Application($(document.body), {
  layout: "mainDiv",
  transition: "slide",
  skin: "nova",
  icon: {
    "": '@Url.Content("~/content/mobile/AppIcon72x72.png")',
    "72x72": '@Url.Content("~/content/mobile/AppIcon72x72.png")',
    "76x76": '@Url.Content("~/content/mobile/AppIcon76x76.png")',
    "114x114": '@Url.Content("~/content/mobile/AppIcon72x72@2x.png")',
    "120x120": '@Url.Content("~/content/mobile/AppIcon76x76@2x.png")',
    "152x152": '@Url.Content("~/content/mobile/AppIcon76x76@2x.png")'
  }
});
//CONFIG: Length of each time window
  const NUM_DATA_PER_FRAME = 200;
  
  //Arrays for saving the raw sensor data
  var xdata = [];
  var ydata = [];
  var zdata = [];
  var num_data = 0;
  
  //Features
  var xmin = 0.0;
  var xmax = 0.0;
  var xave = 0.0;
  var ymin = 0.0;
  var ymax = 0.0;
  var yave = 0.0;
  var zmin = 0.0;
  var zmax = 0.0;
  var zave = 0.0;
  
  //////////////////////////////////////////////////////
  //Function to get sensor access permission from the browser
  //////////////////////////////////////////////////////
  function requestMotionPermission(){
    if ( DeviceMotionEvent &&
         typeof DeviceMotionEvent.requestPermission === 'function' ){
        // iOS 13+ の Safari
        // 許可を取得
        DeviceMotionEvent.requestPermission().then(permissionState => {
        if (permissionState === 'granted') {
                // 許可を得られた場合、devicemotionをイベントリスナーに追加
            window.addEventListener("devicemotion", handleAcceleration, false);
        } else {
                // 許可を得られなかった場合の処理
            console.log("Perrmission not granted!");
            alert("Perrmission not granted!");
        }
        }).catch(console.error) // https通信でない場合などで許可を取得できなかった場合
  
    } else {
        //For other devices
        console.log("detected other device. so adding listener...");
        window.addEventListener("devicemotion", handleAcceleration, false);
    }
  
  }
  
  function stopDeviceMotion(){ 
      window.removeEventListener("devicemotion", handleAcceleration, false);
  }
  
  
  ////////////////////////////////////////////////////////////////////
  //Function(1): 読み込まれてきた最新の加速度データ(X,Y,Z)を処理する関数
  //  - この関数は(機種によりますが) 秒速10〜100回というような高頻度で呼ばれます
  ////////////////////////////////////////////////////////////////////
  function handleAcceleration(ev){
  
      //alert("" + event.acceleration.x + " " + event.acceleration.y + " " + event.acceleration.z);
      $('#accel-x').text( ev.acceleration.x );
      xdata.push(ev.acceleration.x);
      $('#accel-y').text( ev.acceleration.y );
      ydata.push(ev.acceleration.y);
      $('#accel-z').text( ev.acceleration.z );
      zdata.push(ev.acceleration.z);
      $('#raw-data').append(ev.acceleration.x + ", " + ev.acceleration.y + ", " + ev.acceleration.z + "\n");
  
      num_data++;
      //If we have enough raw sensor data...
      if( num_data == NUM_DATA_PER_FRAME ){
  
      //execute feature calculations.
      featureExtraction();
  
      //Let's classify the activity!
      var current_activity = classify();
      $('#current_result').text( current_activity );
      
      //clear the raw sensor data
      xdata=[];
      ydata=[];
      zdata=[];
      //Clear the textarea 
      $('#raw-data').empty();
      //Counter back to 0
      num_data=0;
      }
      
  }
  
  ////////////////////////////////////////////////////////////////////
  //Function(2):センサデータから "feature"(特徴量)を計算する関数
  //  - この関数は NUM_DATA_PER_FRAME 変数で設定された数だけセンサデータが
  //    「設定されたタイムフレーム」にたまる度に呼ばれます。
  //  - 例: センサデータが 50Hz (=50 data / seconds)
  //        NUM_DATA_PER_FRAME が 200 の場合
  //        → 約4秒に1度の頻度で呼ばれます
  ////////////////////////////////////////////////////////////////////
  //helper func. to calculate average
  const arrAvg = arr => arr.reduce((a,b) => a + b, 0) / arr.length
  
  function featureExtraction(){
      xmin = Math.min.apply(Math, xdata); $('#xmin').text(xmin);
      xmax = Math.max.apply(Math, xdata); $('#xmax').text(xmax);
      xave = arrAvg(xdata); $('#xave').text(xave);
      
      ymin = Math.min.apply(Math, ydata); $('#ymin').text(ymin);
      ymax = Math.max.apply(Math, ydata); $('#ymax').text(ymax);
      yave = arrAvg(ydata); $('#yave').text(yave);
  
      zmax = Math.max.apply(Math, zdata); $('#zmax').text(zmax);
      zmin = Math.min.apply(Math, zdata); $('#zmin').text(zmin);
      zave = arrAvg(zdata); $('#zave').text(zave);
  }
  
  ////////////////////////////////////////////////////////////////////
  //Function(3): 最新フレームにおける特徴量(feature)から、現在のユーザの
  //行動を分類 (classify) する関数          
  //  - ここに書いてあるのは、手打ちで書いたサンプルのif文ロジックです
  //  - 実際には機械学習エンジンが出力したif文の固まり (決定木アルゴリズムの場合)
  //  - がここに入ります
  ////////////////////////////////////////////////////////////////////
  function classify(){
  
      if(zmin <= 0.1){
      if(xmin <= -0.2){
          if(xmin <= -0.4){
          return 'walking';
          }else{
          return 'still';
          }
      }else{
          return 'walking';
      }
      }else{
      return 'still';
      }
        
  }


//位置情報とマッピング


var map = L.map('map');
// OpenStreetMapタイルレイヤーを追加する
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'}).addTo(map);

if(navigator.geolocation){

    navigator.geolocation.watchPosition(
	function(position){
	    var data = position.coords;
	    var lat = position.coords.latitude;
	    var lng = position.coords.longitude;
	    var accLatlng = position.coords.accuracy;
	    var alt = position.coords.altitude;
	    var accAlt = position.coords.altitudeAccuracy;

	    var heading = position.coords.heading;
	    var speed = position.coords.speed;

	    document.getElementById( 'result' ).innerHTML = '<dl><dt>緯度</dt><dd>' + lat
		+ '</dd><dt>経度</dt><dd>' + lng
		+ '</dd><dt>高度</dt><dd>' + alt
		+ '</dd><dt>緯度、経度の精度</dt><dd>' + accLatlng
		+ '</dd><dt>高度の精度</dt><dd>' + accAlt
		+ '</dd><dt>方角</dt><dd>' + heading
		+ '</dd><dt>速度</dt><dd>' + speed
		+ '</dd></dl>';

	    map.setView([lat, lng], 17);
	    // L.marker([lat, lng]).addTo(map);
        
        //L.marker([lat, lng]).addTo(map);
	},

	function(error)
	{
	    // エラーコード(error.code)の番号
	    // 0:UNKNOWN_ERROR				原因不明のエラー
	    // 1:PERMISSION_DENIED			利用者が位置情報の取得を許可しなかった
	    // 2:POSITION_UNAVAILABLE		電波状況などで位置情報が取得できなかった
	    // 3:TIMEOUT					位置情報の取得に時間がかかり過ぎた…

	    // エラー番号に対応したメッセージ
	    var errorInfo = [
		"原因不明のエラーが発生しました…。" ,
		"位置情報の取得が許可されませんでした…。" ,
		"電波状況などで位置情報が取得できませんでした…。" ,
		"位置情報の取得に時間がかかり過ぎてタイムアウトしました…。"
	    ];

	    // エラー番号
	    var errorNo = error.code;

	    // エラーメッセージ
	    var errorMessage = "[エラー番号: " + errorNo + "]\n" + errorInfo[ errorNo ];

	    // アラート表示
	    alert( errorMessage );

	    // HTMLに書き出し
	    document.getElementById("result").innerHTML = errorMessage;
	},

	// [第3引数] オプション
	{
	    "enableHighAccuracy": true,
	    "timeout": 8000,
	    "maximumAge": 2000,
	}

    );

}else{
    // 対応していない場合
    var errorMessage = "お使いの端末は、GeoLacation APIに対応していません。";
    alert( errorMessage );
    document.getElementById( 'result' ).innerHTML = errorMessage;
}
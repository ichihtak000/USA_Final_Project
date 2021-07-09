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
	    // var accLatlng = position.coords.accuracy;
	    var alt = position.coords.altitude;
	    // var accAlt = position.coords.altitudeAccuracy;

	    // var heading = position.coords.heading;
	    // var speed = position.coords.speed;

	    document.getElementById( 'result' ).innerHTML = '<dl><dt>緯度</dt><dd>' + lat
		+ '</dd><dt>経度</dt><dd>' + lng
		+ '</dd><dt>高度</dt><dd>' + alt
		// + '</dd><dt>緯度、経度の精度</dt><dd>' + accLatlng
		// + '</dd><dt>高度の精度</dt><dd>' + accAlt
		// + '</dd><dt>方角</dt><dd>' + heading
		// + '</dd><dt>速度</dt><dd>' + speed
		// + '</dd></dl>';

	    map.setView([lat, lng], 17);
	    L.marker([lat, lng]).addTo(map);
        
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
	    "timeout": 1000,
	    "maximumAge": 2000,
	}

    );

}else{
    // 対応していない場合
    var errorMessage = "お使いの端末は、GeoLacation APIに対応していません。";
    alert( errorMessage );
    document.getElementById( 'result' ).innerHTML = errorMessage;
}
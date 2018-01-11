<?php

if( isset( $_GET['list'] ) ){

	header('Content-Type: application/json');

	$response = [];

	$response['items'] = [];

	for ($i=0; $i < 50; $i++) { 
		$response['items'][] = [
			// 'value' => 'val' . $i,
			'id' => 'id' . $i,
			'text' => 'item' . $i,
			'extra' => 'hello' . $i
		];
	}

	echo json_encode( $response );

	exit;
}

if( $_POST ){

	header('Content-Type: application/json');

	$response = [];

	$response['status'] = 'ok';

	$response['gotKey'] = $_POST['key'];

	$response['gotName'] = $_POST['name'];

	$response['newValue'] = 'Value! ' . $_POST['value'];

	$response['newText'] = 'Text! ' . $_POST['value'];

	echo json_encode( $response );

	exit;

}

?><!DOCTYPE html>
<html>
<head>
	<title>Brax-Editable</title>
	<meta charset="utf-8" />

	<!--<script src="js/selectivity.js"></script>-->
	<link href="css/selectivity.min.css" rel="stylesheet" />

	<script src="js/brax-editable.js"></script>
	<link href="css/brax-editable.css" rel="stylesheet" />

	<style>

		body {
			
			font: 14px 'Open Sans', Arial;

		}

	</style>

</head>
<body>

	<a
		data-editable="1"
		data-name="input-text"
		data-value="testValue"
		data-type="text"
		data-url="index.php"
		data-key="1337"
	>Test</a>

	<br><br>

	<a
		data-editable="1"
		data-name="input-date"
		data-value="2018-01-05"
		data-type="date"
		data-url="index.php"
		data-key="1337"
	>Date</a>

	<br><br>

	<a
		data-editable="1"
		data-name="input-time"
		data-value="21:00"
		data-type="time"
		data-url="index.php"
		data-key="1337"
	>Time</a>

	<br><br>

	<a
		data-editable="1"
		data-name="input-datetime"
		data-value="2018-01-05 21:00"
		data-type="datetime"
		data-url="index.php"
		data-key="1337"
	>DateTime</a>

	<br><br>

	<a
		data-editable="1"
		data-name="input-select"
		data-value="val5"
		data-type="select"
		data-source="?list"
		data-url="index.php"
		data-key="1337"
	>Select</a>

	<br><br>

	<a
		data-editable="1"
		data-name="input-selectivity"
		data-value="id5"
		data-type="selectivity"
		data-source="?list"
		data-template="test"
		data-url="index.php"
		data-key="1337"
	>Selectivity</a>

	<script>

		var a = document.querySelectorAll('a[data-editable]');

		for( var e of a ){

			var b = new BraxEditable( e );

		}

	</script>

</body>
</html>
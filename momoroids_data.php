#!/usr/bin/php
<?
header("Access-Control-Allow-Origin: *");
#ini_set('display_errors',1);
#ini_set('display_startup_errors',1);
#error_reporting(-1);

$dbfile = '/afs/ir/users/m/o/moqiant/momoroids_data/momoroids.db';
$db = new SQLite3($dbfile) or die('Can not open database.');

$sql = <<<EOD
  CREATE TABLE IF NOT EXISTS user_data (
    id STRING PRIMARY KEY,
    timestamp DATETIME,
    ip STRING,
    username STRING,
    category STRING,
    level INT,
    score INT,
    version STRING,
    status STRING)
EOD;
$db->exec($sql) or die("Can not create table: {$db->lastErrorMsg()}");

if(isset($_POST['username'])){
    $ts = time();
    $ip = $_SERVER['REMOTE_ADDR'];
    $name = SQLite3::escapeString(isset($_POST['username']) ? $_POST['username'] : 'na');
    $cat = SQLite3::escapeString(isset($_POST['cat']) ? $_POST['cat'] : 'na');
    $level = SQLite3::escapeString(isset($_POST['level']) ? $_POST['level'] : 'na');
    $score = SQLite3::escapeString(isset($_POST['score']) ? $_POST['score'] : 'na');
    $version = SQLite3::escapeString(isset($_POST['version']) ? $_POST['version'] : 'na');
    $status = SQLite3::escapeString(isset($_POST['status']) ? $_POST['status'] : 'na');

    $sql = "INSERT INTO user_data (timestamp,ip,username,category,level,score,version,status) VALUES('$ts','$ip','$name','$cat','$level','$score','$version','$status')";
    $db->exec($sql) or die("Can not insert user data: {$db->lastErrorMsg()}");

}else{
    # GET request-- show the data
    $stat = SQLite3::escapeString(isset($_REQUEST['stat']) ? $_REQUEST['stat'] : 'endgame');
    if($stat=='all'){
        $sql = "SELECT datetime(timestamp,'unixepoch','localtime') "
              ."AS date,username,ip,category,level,score,status "
              ."FROM user_data ORDER BY ip,timestamp";
        $result = $db->query($sql) or die("Select query failed: {$db->lastErrorMsg()}");
        while ($row = $result->fetchArray()){
            echo "{$row['date']}\t{$row['ip']}\t{$row['username']}\t{$row['category']}\t"
                ."{$row['level']}\t{$row['score']}\t{$row['status']}<br>\n";
        }
    }else{
        echo "<H2>Momoroids Leaderboard:</H2>\n";
        $sql = "SELECT date(timestamp,'unixepoch','localtime') "
              ."AS date,username,category,level,score "
              ."FROM user_data WHERE status LIKE '{$stat}' ORDER BY score DESC";
        $result = $db->query($sql) or die("Select query failed: {$db->lastErrorMsg()}");
        echo "<table cellpadding='5'>\n";
        echo "<tr align='center'><th>Date</th><th>Name</th><th>Momoroid</th><th>Level</th><th>Score</th></th>\n";
        while ($row = $result->fetchArray()){
            echo "<tr align='center'>";
            echo "<td>{$row['date']}</td>"
                ."<td>{$row['username']}</td>"
                ."<td>{$row['category']}</td>"
                ."<td>{$row['level']}</td>"
                ."<td>{$row['score']}</td>\n";
            echo "</tr>";
        }
        echo "</table>\n";
    }
}
?>


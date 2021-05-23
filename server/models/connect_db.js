const mysql = require('mysql')

var connection = mysql.createConnection({
    
    host:process.env.db_host,
    user:process.env.db_user,
    password:process.env.db_password,
    database:process.env.database

})

connection.connect(function(err) {
    if (err) { console.error('error connecting: ' + err.stack); return;} 
    console.log(`connected to mysql ${process.env.database}`);
});

module.exports = connection
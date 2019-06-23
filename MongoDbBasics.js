//show databases
db.adminCommand('listDatabases')

//use a database "MyFirstDb"
db = db.getSiblingDB('MyFirstDb')

//show all collections (tables)
db.getCollectionNames()

//show users
db.getUsers()

//show roles
db.getRoles({showBuiltinRoles: true})

//show all logs
db.adminCommand({ 'getLog' : '*' })

//create a user
db.createUser(
  {
    user: "StudentUser",
    pwd: "1234",
    roles: [ { role: "read", db: "Student" } ]
  }
)


//----------------------------------------------------------------------------
//CREATE ALTER DROP RENAME (DDL)
//----------------------------------------------------------------------------

//1. create a database "MyFirstDb" (you must create a document as a second step to create the database)
use MyFirstDb

//2. show all collections
db.getCollectionNames()

//3. create a collection (table)
db.createCollection("Student");

//4. rename a collection (table)
db.Student.renameCollection("StudentCollection");

//5. ALTER does not exist

//6. DROP table
db.Student.drop()

//7. DROP database
use MyFirstDb
db.dropDatabase()



//----------------------------------------------------------------------------
// SELECT INSERT UPDATE DELETE (DML)
//----------------------------------------------------------------------------

//1. INSERT a document (record)
db.Student.insert({FirstName:"Otto",LastName:"Negron"});
db.Student.insert({FirstName: "Juan", MiddleName: "Pablo", LastName: "Montoya", Address: "001, Miami Beach, Florida"});
db.Student.insertMany([
{FirstName: "Fernando", LastName: "Alonso"},
{FirstName: "Emerson", LastName: "Fittipaldi"}
]);

//2. SELECT/find all documents (records)
db.Student.find();

//3. SELECT/find a document by ID number
db.Student.find("5b89b1028c8b64c9c938d6df"); 

//4. SELECT/find a document by field (NO WHERE CLAUSE)
db.student.find({}, {FirstName:1, _id:0})

//5. SELECT/find a document column with WHERE clause (where first name = otto)
db.Student.find({FirstName:"Otto"});

//6. SELECT/find a document column (WHERE NAME LIKE 'Ne')
db.Student.find({"LastName": /Ne/});


//7. SELECT with AND (not used in my tutorial)
db.inventory.find( { $and: [ { price: { $ne: 1.99 } }, { price: { $exists: true } } ] } )

//8. SELECT with AND and OR in "Inventory" table (not used in my tutorial)
db.inventory.find( {
    $and : [
        { $or : [ { price : 0.99 }, { price : 1.99 } ] },
        { $or : [ { sale : true }, { qty : { $lt : 20 } } ] }
    ]
} )


//7. UPDATE a document (record)
db.F1Driver.update({FirstName:"Emerson"},{$set:{IndyWins:["1983","1993"]}});
db.F1Driver.update({FirstName:"Pietro"},
	{
		$set:{IndyWins:["1983","1993"], 
		FirstName: "Emerson", 
		LastName: "Fittipaldi"}
	}
);

//8. DELETE a document (record)
db.F1Driver.remove("5b89b1028c8b64c9c938d6df");

//----------------------------------------------------------------------------
// GRANT REVOKE (DCL)
//----------------------------------------------------------------------------

//CREATE A ROLE
use Student
db.createRole(
   {
     role: "myfirstrole",
     privileges: [
       { resource: { db: "Student", collection: "StudentCollection" }, actions: ["insert"] },
     ],
     roles: [
       { role: "read", db: "Student" }
     ]
   }
)

//GRANT A ROLE
use Student
db.grantRolesToUser(
   "StudentUser",
   [ "myfirstrole" , { role: "myfirstrole", db: "Student" } ],
   { w: "majority" , wtimeout: 4000 }
);

//----------------------------------------------------------------------------
// LOGIN AND ENABLING AUTHENTICATION
//----------------------------------------------------------------------------
//install as a windows service. When complete, paste in the command line:



//1. GO HERE
cd c:\Program Files\MongoDB\Server\4.0\bin


//2. do this
mongod --port 27017 --dbpath "c:\data\db"

//3. then go here in a second command prompt
"C:\Program Files\MongoDB\Server\4.0\bin\mongo.exe"

//4. then create user

db.createUser(
  {
    user: "myUserAdmin",
    pwd: "abc123",
    roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
  }
);

db.createUser(
{
   user: "AllPowerfulAdmin",
   pwd: "1234",
   roles: [ { role: "root", db: "admin" } ]
});
//5.close both command prompts
//6. restart mongod 
cd c:\Program Files\MongoDB\Server\4.0\bin
mongod --auth --port 27017 --dbpath "c:\data\db"

//7. open second commandprompt and run
"C:\Program Files\MongoDB\Server\4.0\bin\mongo.exe"

// run
use admin
show dbs // should fail now because requires authentication

//10. authenticate with admin role
use admin
db.auth('myUserAdmin', 'abc123')
db.auth('AllPowerfulAdmin', '1234')



//----------------------------------------------------------------------------
// ENCRYPTING THE DATABASE
//----------------------------------------------------------------------------

//1. CREATE A TEXT FILE WITH A STRING OF 32 CHARACTERS. THIS WILL BECOME THE MASTER KEY. 
//FILENAME = "mongodb-keyfile"

//2. CONVERT THE FILE TO BASE64. WINDOWS COMMANDS IN COMMAND PROMPT:
certutil -encode mongodb-keyfile.txt tmp.b64 && findstr /v /c:- tmp.b64 > mongodb-keyfile.b64
// NOTE: IF YOU NEED TO DECODE, THE COMMAND IS:
certutil -decode mongodb-keyfile.b64 mongodb-keyfile.txt

//3.MODIFY FILE PERMISSIONS WITH WINDOWS COMMAND LINE (read and write only)
//can try something like this...  C:\>icacls "c:\data\mongodb-keyfile.b64" /grant "LAPTOP-A9JF22K1\AsuS":(W)
//or modify read + write permissions in file properties of Windows GUI.

//4. MAKE SURE THE DBPATH FOLDER IS EMPTY OR YOU WILL HAVE ISSUES. If you already have databases inside,
//then download the datadump and upload again when encryption is ON.

//4. start mongod with the following commands and using the keyfile in base 64 "c:\data\mongodb-keyfile.b64"
cd c:\Program Files\MongoDB\Server\4.0\bin
mongod --auth --port 27017 --dbpath "c:\data\db" --enableEncryption --encryptionKeyFile "c:\data\mongodb-keyfile.b64"
//mongod encryption without auth (for testing)
mongod --port 27017 --dbpath "c:\data\db" --enableEncryption --encryptionKeyFile "c:\data\mongodb-keyfile.b64"
	


//----------------------------------------------------------------------------
// AUDITING THE DATABASE
//----------------------------------------------------------------------------

//1. CONFIGURE MONGOD WITH AUDITING COMMAND
cd c:\Program Files\MongoDB\Server\4.0\bin
mongod --port 27017 --dbpath "c:\data\db" --auditDestination file --auditFormat BSON --auditPath "c:\data\db\auditLog.bson"
"C:\Program Files\MongoDB\Server\4.0\bin\mongo.exe"
//OR WITH ENCRYPTION ENABLED...
mongod --port 27017 --dbpath "c:\data\db" --enableEncryption --encryptionKeyFile "c:\data\mongodb-keyfile.b64" --auditDestination file --auditFormat BSON --auditPath "c:\data\db\auditLog.bson"

//2. PERFORM SOME ACTIONS ON DATABASE


//3. VIEW AUDIT LOG. PLEASE TYPE THIS IN A NEW COMMAND LINE AND NOT THE MONGO SHELL.
cd c:\Program Files\MongoDB\Server\4.0\bin
bsondump "c:\data\db\auditLog.bson"



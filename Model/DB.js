var mysql = require('mysql');

class DB {
    constructor() {
        this.con = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DB,
            charset: 'utf8mb4',
            port:  process.env.DB_PORT

        });
      
    }
    allowAll(idOrg){
        this.listUserByOrg(idOrg, users=>{
            var allowsAr = []
            users = JSON.parse(users)
            users.forEach(user=>{
                allowsAr.push(user.id)
            })            
            
            var allows= allowsAr.join()
            var SQL =  "UPDATE users_db SET allow = '"+allows+"' WHERE organization_id = '"+idOrg+"'"
            this.con.query(SQL, (err, rows) => {
                if (err) console.log(err)
              
                
            })  
        })
        this.allDepsFromID(idOrg,deps=>{
            var allowsDepAr  = []
            deps =JSON.parse(deps)
            deps.forEach(dep=>{
                allowsDepAr.push(dep.id)
            })
            var allowsDep = allowsDepAr.join()
            var SQL =  "UPDATE users_db SET allow_dep = '"+allowsDep+"' WHERE organization_id = '"+idOrg+"'"
            this.con.query(SQL, (err, rows) => {
                if (err) console.log(err)
                console.log('succes')
                
            })
        })
    }  
 
    allowFirst(idOrg ){
        var firstSQL = "SELECT MAX(id) FROM users_db"
        this.con.query(firstSQL,(err,result)=>{
            var id = result[0]['MAX(id)']
            this.listUserByOrg(idOrg, users=>{
                var allowsAr = []
                users = JSON.parse(users)
                users.forEach(user=>{
                    allowsAr.push(user.id)
                })            
                
                var allows= allowsAr.join()
                var SQL =  "UPDATE users_db SET allow = '"+allows+"' WHERE id = '"+id+"'"
                this.con.query(SQL, (err, rows) => {
                    if (err) console.log(err)
                  
                    
                })  
            })
            this.allDepsFromID(idOrg,deps=>{
                var allowsDepAr  = []
                deps =JSON.parse(deps)
                deps.forEach(dep=>{
                    allowsDepAr.push(dep.id)
                })
                var allowsDep = allowsDepAr.join()
                var SQL =  "UPDATE users_db SET allow_dep = '"+allowsDep+"' WHERE id = '"+id+"'"
                this.con.query(SQL, (err, rows) => {
                    if (err) console.log(err)
                    console.log('succes')
                    
                })
            })
            //update dos outros
            id = id.toString()
            var SQLall =  'UPDATE users_db SET allow = CONCAT(allow , "'+ ","+id+'") WHERE organization_id = "'+idOrg+'"'
            this.con.query(SQLall, (err,rows)=>{
                if (err) console.log(err)
               
            })

        })
    
    }
    getLimitUpload(org, callback){
        // var SQL = "SELECT plan FROM organization_db WHERE id = "+org
        // this.con.query(SQL, (err,result)=>{
        //     if (err) console.log(err), callback()
        //     var SQL2 = "SELECT upload_size FROM plans_db WHERE name = '"+result[0].plan+"'"
        //     this.con.query(SQL2, (err, result)=>{
        //         callback(result[0].upload_size)
        //     })
        // })
    }


    getUserPlan(org, callback){
        // var SQL1 = "SELECT plan FROM organization_db WHERE id = "+org
        // this.con.query(SQL1, (err,result)=>{
        //     if (err) console.log(err), callback()
        //     var SQL2 = "SELECT qnt_user_common FROM plans_db WHERE name = '"+result[0].plan+"'"
        //     this.con.query(SQL2, (err, result)=>{
        //         callback(result[0].qnt_user_common)
        //     })
        // })
    }

    howMany(org, callback){
        var SQL = "SELECT * from users_db where organization_id = " + org
        this.con.query(SQL, (err, rows) => {
            if (err) console.log(err), callback()
            console.log(rows.length,'SIZE')
            callback(rows.length)
        })

    }   
    findOneToEdit(id, callback) {
        var SQL = "SELECT * from users_db where id = " + id
        this.con.query(SQL, (err, rows) => {
            if (err) console.log(err), callback()
            callback(rows[0])
        })
    }

    editDepById(depId, depName,callback){
        var SQL = "UPDATE department_db SET name = '"+depName+"' WHERE id = "+depId
        this.con.query(SQL, (err, rows) => {
            if (err) console.log(err),
            console.log(rows)
            callback(rows)
        })
    }

    emailIsValid(email, callback) {
        var SQL = "SELECT * FROM users_db where email = " + email

        this.con.query(SQL, (err, rows) => {
            if (err) throw err

            if (rows.length > 0) {
                callback(true)
            } else {
                callback(false)
            }

        })
    }

    linkRememberPassword(hash, email, callback) {
        var email = JSON.parse(email)
        var SQL = "UPDATE users_db SET remember_password = '" + hash + "' where email = '" + email + "' "

        this.con.query(SQL, (err, rows) => {
            if (err) throw err
            callback(hash)
        })
    }
    auth(email, callback) {
        //console.log(typeof email)
        var sql = "SELECT * from users_db where email = '" + email + "'"
        this.con.query(sql, (err, rows) => {
            if (err) console.log(err), callback(err)
            callback(rows)
        })
    }


    listUserByOrg(id, callback) {
       // console.log(id)
        var sql = "SELECT users_db.*, department_db.name as name_department, organization_db.name as name_organization " +
            "FROM users_db " +
            "INNER JOIN organization_db ON users_db.organization_id = organization_db.id " +
            "INNER JOIN department_db ON users_db.department_id = department_db.id " +
            "WHERE users_db.organization_id = " + id;

        this.con.query(sql, function(err, result) {
            if (err) {
                console.log(err)
                throw err;
            }
            var user = JSON.stringify(result)
            return callback(user);
        })
    }

    listUserByOrg2(id, callback) {
        // console.log(id)
         var sql = "SELECT users_db.name, users_db.email, users_db.phone, users_db.extension, "+
             "department_db.name as department_name, organization_db.name as name_organization " +
             "FROM users_db " +
             "INNER JOIN organization_db ON users_db.organization_id = organization_db.id " +
             "INNER JOIN department_db ON users_db.department_id = department_db.id " +
             "WHERE users_db.organization_id = " + id;
 
         this.con.query(sql, function(err, result) {
             if (err) {
                 console.log(err)
                 throw err;
             }
             var user = JSON.stringify(result)
             return callback(user);
         })
     }
     
    allDepsFromID(id, callback) {
        //var sql = "SELECT * FROM department_db WHERE organization_id = " + id;
        var sql = "SELECT organization_db.name AS name_organization, department_db.* " +
            "FROM department_db INNER JOIN organization_db ON department_db.organization_id = " +
            "organization_db.id WHERE organization_db.id = " + id
        this.con.query(sql, function(err, result) {
          //  console.log(id, result, 'sele deps')
            var departments = JSON.stringify(result)
            if (err) {
                console.log(err.errno)
                if (err.errno == 1054) {
                    departments = "errors"
                    return callback(departments)
                }

            } else {
                return callback(departments);
            }
        })
    }
    newDepartment(org, callback) {
        var sql = "INSERT INTO department_db (name, organization_id) VALUES (?)"
       // console.log(org, 'depdb')
        var values = [org.name, org.organization_id]
        this.con.query(sql, [values], function(err, result) {
            var department = "Departamento Adicionado!"
            if (err) {
                if (err.errno == 1062) {
                    return callback(user = "já existente")
                } else {
                    throw err;
                }
            } else {
                console.log("Number of records inserted: " + JSON.stringify(result))
                console.log(result)
                return callback({department,id:result.insertId});
            }
        })

    }

    editByID(id, user, callback) {

        var ext = user.extension ? " extension = " + user.extension + " ," : ""
        var bio = user.bio ? " bio = '" + user.bio + "' ," : ""
        var phone = user.phone ? " phone = '" + user.phone + "' ," : ""
        var last = ext + bio + phone
        last = last.substring(0, last.length - 1)
        var sql = "UPDATE users_db SET" + last + " WHERE id = " + id
        this.con.query(sql, function(err, result) {
            if (err) {
                console.log(err.errno, err)
                var user = "error"
                return callback(user);

            } else {
                var user = "Usuario Alterado"
                console.log("Number of records inserted: " + JSON.stringify(result))
                return callback(user);
            }
        })
    }
    savePicById(id, link, callback) {
        var sql = "UPDATE users_db SET file_picture = '" + link + "' WHERE id = " + id
        this.con.query(sql, function(err, result) {
            if (err) {
                console.log(err.errno, err)
                var user = "error"
                return callback(user);

            } else {
                var user = "Usuario Alterado"
                console.log("Number of records inserted: " + JSON.stringify(result))
                return callback(user);
            }
        })
    }

    changePassword(token, hashPassword, callback) {
        var SQL = "UPDATE `users_db` SET `remember_password` = '', " +
            "`password` = '" + hashPassword + "' " +
            "WHERE `users_db`.`remember_password` = '" + token + "'"

        this.con.query(SQL, (err, rows) => {
            if (err) throw err;
            return callback('Senha Alterada!')
        })
    }

    changePass(id, newPass, callback){  
        var SQL ="UPDATE `users_db` SET password = '"+newPass+"' WHERE id = '"+id+"'"
        this.con.query(SQL, (err, rows) => {
            if (err)return callback('Algo deu Errado!')
            return callback('Senha Alterada!')
        })

    }
    
    atualizaUser(email, dados, callback){
        var sql  = "UPDATE `users_db` SET name = '"+ dados.name+"', department_id = '"+dados.department_id+"', phone= '"
        +dados.phone+"', extension = '"+dados.extension+"' WHERE email = '"+email+"'"
        var values = [dados.name, dados.department_id, dados.phone, dados.extension]
        this.con.query(sql, function(err, result) {
            var user = "Usuarios Alterados"
            if (err) {
                var error = "error"
                console.log(err)
                return callback(error)
            } else {

                return callback(user)
            }
        })

    }


    addDepInUser(idUser, newDep, callback) {
        var sql = "UPDATE users_db SET department_id = '" + newDep + "' WHERE id = '" + idUser + "'"
        this.con.query(sql, function(err, result) {
            var user = "Usuarios Alterados"
            if (err) {
                var error = "error"
                console.log(err)
                return callback(error)
            } else {

                return callback(user)
            }
        })
    }




    changeActivityUser(idUser, act, callback) {
        act == "Ativo" ? act = 1 : act = 0;
        var sql = "UPDATE users_db SET active = " + act + " WHERE id = '" + idUser + "'"
        this.con.query(sql, function(err, result) {
            var user = "Usuarios Alterados"
            if (err) {
                var error = "error"
                console.log(err)
                return callback(error)
            } else {

                return callback(user)
            }
        })

    }


    newUser(user, callback) {

        var sql = "INSERT INTO users_db (active,organization_id, name, email, department_id, password, phone) VALUES (?)"
        var values = [1, user.organization_id, user.name, user.email, user.department_id, user.password, user.phone]
        this.con.query(sql, [values], function(err, result) {

            var user = "Usuário Adicionado!"
            if (err) {
                console.log(err)
                if (err.errno == 1062) {
                    (user = "já existente")
                    return callback(user)
                }
                if (err.errno == 1048) {
                    (user = "email inválido")
                    return callback(user)
                }

            }
                
               // console.log("Number of records inserted: " + JSON.stringify(result))
                
            callback(user)
             
        })
        
    }

    editByEmail(email, user, callback) {
        var sql = "UPDATE users_db SET name= '" + user.name + "' , email = '" + email + "' , department_id = '" + user.department_id + "' , phone = '" + user.phone + "' WHERE email = '" + email + "'"
        this.con.query(sql, function(err, result) {
            if (err) {
                console.log(err.errno, err)
                var user = "error"
                return callback(user);

            } else {
                var user = "Usuario Alterado"
                console.log("Number of records inserted: " + JSON.stringify(result))
                return callback(user);
            }
        })
    }
    showUserByDeps(id, callback) {
        var sql = "SELECT * FROM users_db WHERE department_id = " + id

        this.con.query(sql, function(err, result) {
            if (err) {
                console.log(err)
                throw err;
            }

            return callback(result);
        })
    }

    saveAllows(userId, allows, groups, callback) {
        var all = allows.join()
        var depsAll = groups.join()
        var sql = "UPDATE users_db SET allow = '" + all + "', allow_dep = '" + depsAll + "' WHERE id = " + userId
        this.con.query(sql, function(err, result) {
            if (err) console.log(err)
            console.log(result)
            return callback(result)
        })
    }

}


module.exports = { DB }
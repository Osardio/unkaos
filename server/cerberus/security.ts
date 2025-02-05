var security : any = {}

import tools from "../tools";

import sql from "./sql";

var jwt = require('jsonwebtoken');
const key = 'shhhhh'

security.newToken = async function(workspace : String, email : String, pass : String){
    let users = await sql`SELECT * FROM  ${sql(workspace + '.users') }  WHERE 
        mail=${ email } AND 
        password = MD5(${ pass }) AND deleted_at IS NULL AND active`

    console.log(email, pass)

    if(!users || users.length != 1) return null

    let user_data = { uuid: users[0].uuid }
    let token = jwt.sign(user_data, key)

    let ans = await sql`INSERT INTO  ${sql(workspace + '.user_sessions') } (uuid, user_uuid, token) 
        values( ${ tools.uuidv4() }, ${ users[0].uuid }, MD5(${ token }))`

    return {user_token: token, profile: users[0]}
}

security.setPassword = async function(workspace : String, user : any, newPassword : String){
    sql`UPDATE  ${sql(workspace + '.users') } SET password = MD5(${ newPassword }) WHERE uuid=${ user.uuid }`
}

security.checkUserIsAdmin = async function (workspace: string, user: any) : Promise<boolean> {
    const roles = await sql`SELECT r.name FROM ${sql(workspace + '.users')} u 
        INNER JOIN ${sql(workspace + '.users_to_roles')} ur on u.uuid = ur.users_uuid
        INNER JOIN ${sql(workspace + '.roles')} r on ur.roles_uuid = r.uuid
        WHERE u.uuid=${ user.uuid }`
    return (roles.find((role: any) => role.name == 'Администратор') !== undefined)
}

const generateRandomPassword = function(){
    const pass_chars = "0123456789abcdefghijklmnopqrstuvwxyz!@#$%^&*()ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const pass_len = 12;
    let password = ''
    for (var i = 0; i <= pass_len; i++) {
        let rand_num = Math.floor(Math.random() * pass_chars.length);
        password += pass_chars.substring(rand_num, rand_num +1);
    }
    return password
}

security.setRandomPassword = async function(workspace : String, user : any) : Promise<string> {
    const password = generateRandomPassword()
    await security.setPassword(workspace, user, password)
    return password
}

export default security

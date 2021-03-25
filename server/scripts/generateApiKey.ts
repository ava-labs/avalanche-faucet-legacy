import {connectDB, createApiKey} from "../db";


async function main(){
    let args = process.argv;

    let name = args[2]
    let nAvaxLimit = parseInt(args[3])

    if(!name || !nAvaxLimit){
        throw "Invalid arguments."
    }

    try{
        let connection = await connectDB()
        let key = await createApiKey(name,nAvaxLimit)
        connection.close()
        return key
    }catch (e){
    }

}
main().then(key => {
    console.log(key)
}).catch((e: any) =>{
    console.error(e)
})

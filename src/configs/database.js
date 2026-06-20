const {mongoose} = require('mongoose');

async function connectToDatabase(){
    try{
        const result = await mongoose.connect('mongodb+srv://Himan_Mongodb:RUELDiz09aXD1Frj@himanmongodbcluster.qv33llb.mongodb.net/devTinder');
        return result;  
    }catch(err){
        return err
    }
}

module.exports = connectToDatabase;
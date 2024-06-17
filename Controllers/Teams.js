const Teams = require("../Models/UserModel")
const multer = require('multer');
const fs = require('fs');
const path = require('path');


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '_' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

const CreateTeams=async(req, res) => {

  const image = req.file;

  const {FristName,MiddleName,LastName,PhoneNumber,Email,Gender,UserName,Nin,password}= req.body

  try {
   
    // if (!image) {
    //     const error = new Error('Please upload a file');
    //     error.status = 400;
    //     throw error;
    //   }
    //   console.log(image)
      const teams = await Teams.create({
        FristName,MiddleName,LastName,PhoneNumber,Email,Gender,UserName,Nin,password
      
      }).then(result =>{
        
        res.status(200).json(result)
        return result
      })

      
      // res.send(file)
  } catch (error) {
    res.status(400).json({error:error.message})
  }
  ;
}

const GetAllTeamMembers = async (req,res)=>{
  try {
    const teams = await Teams.findAll()
    
    .then(result =>{
      
      res.status(200).json(result)
    })
  } catch (error) {
    res.status(400).json({error:error.message})
  }
}



const GetSingleMemeber = async(req,res)=>{
  const Teamid = req.params.id
  
  try {

    const Getone = await Teams.findOne({where: {id:Teamid}}).then(result =>{
      res.status(200).json({result,Modles})
    })
  } catch (error) {
    res.status(400).json({error:error.message})
  }
}

const UpdateMember = async (req, res) => {
  try {
    const image = req.file;
    const {Id} =req.params
  const {Name,Position,PhoneNumber,Email,whatsAppNumber}= req.body

  // if (!image) {
  //   const error = new Error('Please upload a file');
  //   error.status = 400;
  //   throw error;
  // }

    const teams = await Teams.update(
      { Name,Position,PhoneNumber,Email,whatsAppNumber },
      { where: { id: Id } }
    ).then(result =>{
      res.status(200).json({message:"Record updated Successfully"})
    })
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};



const DeleteRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const team = await Teams.destroy({
      where: { id },
      cascade: true,
    }).then(result =>{
      res.status(200).json({ message: 'Record deleted successfully' });
    })
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};




module.exports={
    CreateTeams,
  upload,
  GetAllTeamMembers,
  GetSingleMemeber ,
  UpdateMember,
  DeleteRecord,
  
}

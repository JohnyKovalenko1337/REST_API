const { v4: uuidv4 } = require('uuid');

exports.getPosts = (req,res,next)=>{
    res.status(200).json({
        posts:[{title: "first post" , content: "yep that is first"}]
    })
}

exports.createPost = (req,res,next) =>{
    const title = req.body.title;
    const content = req.body.content;
    res.status(201).json({
        message: "post was created successfuly",
        post:{id: uuidv4(), title: title, content: content}
    })
}
const jwt=require("jsonwebtoken")


const createToken=(username)=>{
    const token=jwt.sign({sub: username}, process.env.JWT_SECRET, {expiresIn: '7d'})
    // res.cookie("auth_token", token, {
    //     httpOnly: true,
    //     secure: true, // Use this in production with HTTPS
    //     maxAge: 7 * 24 * 60 * 60 * 1000, // Expires in 7 days
    // });
    
    return token;
}

const verifyToken = (req, res, next) => {
    if(!req.cookies.auth_token){return next()}
    const token = req.cookies.auth_token;
    console.log("req cookies: ",req.cookies.auth_token);

    if (!token) {
        return res.redirect('/'); // Redirect to login if no token
    }

    console.log("trial")
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.error("JWT verification failed:", err);
            return res.redirect('/'); // Redirect to login on error
        }

        console.log("trial")
        req.username= decoded.sub; // Attach the username to the request
        next();
    });
};


module.exports={createToken, verifyToken};
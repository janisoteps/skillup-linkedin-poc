module.exports = {
    homePage: function (req, res) {
        if (req.user) {
            const name = req.user.name.givenName;
            const family = req.user.name.familyName;
            const photo = req.user.photo;
            const email = req.user.email;

            res.send(
                `<div style="font-size:140%"> <p>User is Logged In </p>
                <p>Name: ${name} ${family} </p>
                <p> Linkedn Email: ${email} </p>
                <img src="${photo}"/>
                </div>
                `
            );
        } else {
            res.send(
                `<div style="font-size:160%; width: 300px; margin: 0 auto; font-family: 'Roboto', sans-serif"> 
                <p>This is Home Page </p>
                <p>User is not Logged In</p>
                 <button style="background-color: cornflowerblue; font-size: 2rem; 
                 padding: 10px; border-width: 0; border-radius: 10px; cursor: pointer" 
                 onclick="window.location='/auth/linkedin'">LinkedIn login</button>
                </div>
                `
            );
        }
    }
};

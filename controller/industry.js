import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Industry from '../models/Industry';



module.exports.loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    const industryCheck = await Industry.findOne({ email });
    if (!industryCheck) {
      return res.redirect("/api/v1/industry/login");
    }
    const isMatch = await bcrypt.compare(password, industryCheck.password);
    if (!isMatch) {
      return res.redirect("/api/v1/industry/login");
    }

    const token = jwt.sign({ userId: industryCheck._id, role: "user" }, "process.env.JWT_SECRET", { expiresIn: "5h" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      maxAge: 3600000,
    });

    res.redirect("/api/v1/industry/home");


  } catch (error) {
    console.log(error)
    res.redirect("/api/v1/industry/login")
  }
}



module.exports.signupController =  async (req, res) => {
  try {
    const { companyName, password, email } = req.body;
    const industryCheck = await Industry.findOne({ email });
    if (!indusrtyCheck) {
        alert('Industry exists')
      return res.redirect("/api/v1/industry/signup")
    }

    const hashPassword = await bcrypt.hash(password, 10);
    console.log(hashPassword);
    const industry = await Industry.create({
      companyName, password: hashPassword, email
    });
    (await industry).save()

    return res.redirect("/api/v1/industry/login");
  } catch (error) {
    console.log(error);
    return res.redirect("/api/v1/industry/signup")
  }
}
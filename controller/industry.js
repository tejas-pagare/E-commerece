import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Industry from '../models/Industry.js';



const loginController = async (req, res) => {
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

    const token = jwt.sign({ industry_id: industryCheck._id, role: "industry" }, "JWT_SECRET", { expiresIn: "5h" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      maxAge: 3600000000,
    });

    res.redirect("/api/v1/industry/home");


  } catch (error) {
    console.log(error)
    res.redirect("/api/v1/industry/login")
  }
}



const registerController =  async (req, res) => {
  try {
    const { companyName, password, email } = req.body;
    const industryCheck = await Industry.findOne({ email });
    if (industryCheck) {
        alert('Industry exists')
      return res.redirect("/api/v1/industry/signup")
    }

    const hashPassword = await bcrypt.hash(password, 10);
    console.log(hashPassword);
    const industry = await Industry.create({
      companyName, password: hashPassword, email
    });

    return res.redirect("/api/v1/industry/login");
  } catch (error) {
    console.log(error);
    return res.redirect("/api/v1/industry/signup")
  }
}

export { loginController, registerController };
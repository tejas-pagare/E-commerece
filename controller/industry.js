import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Industry from '../models/Industry.js';



const loginController = async (req, res) => {
  const wantsJson = req.headers.accept?.includes('application/json') || req.is('application/json');

  try {
    const { email, password } = req.body;
    const industryCheck = await Industry.findOne({ email });

    if (!industryCheck) {
      if (wantsJson) {
        return res.status(401).json({ success: false, message: "Invalid email or password" });
      }
      return res.redirect("/api/v1/industry/login?error=Invalid email or password");
    }

    const isMatch = await bcrypt.compare(password, industryCheck.password);
    if (!isMatch) {
      if (wantsJson) {
        return res.status(401).json({ success: false, message: "Invalid email or password" });
      }
      return res.redirect("/api/v1/industry/login?error=Invalid email or password");
    }

    const token = jwt.sign({ industry_id: industryCheck._id, role: "industry" }, "JWT_SECRET", { expiresIn: "5h" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      maxAge: 3600000000,
    });

    if (wantsJson) {
      return res.json({
        success: true,
        message: "Login successful",
        industry: {
          _id: industryCheck._id,
          companyName: industryCheck.companyName,
          email: industryCheck.email,
        }
      });
    }

    return res.redirect("/api/v1/industry/home");

  } catch (error) {
    console.log(error);
    if (wantsJson) {
      return res.status(500).json({ success: false, message: "An error occurred. Please try again." });
    }
    return res.redirect("/api/v1/industry/login?error=An error occurred. Please try again.");
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
const { MailtrapClient } = require("mailtrap");
const { client, sender } = require("./mailtrap.config"); // make sure you export client from mailtrap.config
const {
  VERIFICATION_EMAIL_TEMPLATE,
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
} = require("./emailTemplate");
const { response } = require("../server");
const sendVerificationEmail = async (email, verificationToken) => {
  if (!email) {
    throw new Error("Recipient email is missing!");
  }

  const recipient = [{ email }];

  try {
    const response = await client.send({
      from: sender,
      to: recipient,
      subject: "Verify Your Email",
      html: VERIFICATION_EMAIL_TEMPLATE.replace(
        "{verificationCode}",
        verificationToken
      ),
      category: "Email Verification",
    });

    console.log("Email Sent Successfully", response);
    return response;
  } catch (error) {
    console.error(" Error sending verification email:", error.message);
    throw new Error(`Error sending verification email: ${error.message}`);
  }
};

const sendWelcomeEmail = async (email, name) => {
  const recipient = [{ email }];
  try {
    await client.send({
      from: sender,
      to: [{ email }],
      template_uuid: "3ceaf0cf-4436-48ed-bba0-c9e795e8096e",
      template_variables: {
        company_info_name: "Job-connect",
        name: name,
      },
    });
    console.log("Welcome email sent successfully", response);
  } catch (error) {
    console.error(`Error sending welcome email`, error);
    throw new Error(`Error sending welcome email: ${error}`);
  }
};
const sendPasswordRestEmail = async (email, restURL) => {
  const recipient = [{ email }];
  try {
    const response = await client.send({
      from: sender,
      to: [{ email }],
      subject: "Reset your passwpord",
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL", restURL),
      category: "Password Reset",
    });
  } catch (error) {
    console.error(`Error sending password reset email`, error);
    throw new Error(`Error sending password reset email:${error}`);
  }
};
const sendResetSuccessEmail = async (email) => {
  try {
    const response = await client.send({
      from: sender,
      to: [{ email }],
      subject: "Password Reset Successful",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE,
      category: "password Reset",
    });

    console.log("Password reset email sent successfully", response);
  } catch (error) {
    console.error(`Error sending password reset success email`, error);

    throw new Error(
      `Error sending password reset success email: ${error.message}`
    );
  }
};

module.exports = {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordRestEmail,
  sendResetSuccessEmail,
};

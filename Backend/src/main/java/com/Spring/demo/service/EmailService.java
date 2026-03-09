package com.Spring.demo.service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendOtp(String to, String otp) {

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Library Email Verification");
        message.setText("Your OTP is: " + otp + "\nValid for 5 minutes.");
        mailSender.send(message);
    }
    public void sendApprovalMail(String to, String role) {

    SimpleMailMessage message = new SimpleMailMessage();
    message.setTo(to);
    message.setSubject("Library Account Approved");
    message.setText(
        "Congratulations!\n\n" +
        "Your request to join as " + role + " has been approved by Admin.\n\n" +
        "You can now login to the system.\n\n" +
        "Thank you,\nLibrary Team"
    );

    mailSender.send(message);
}
}
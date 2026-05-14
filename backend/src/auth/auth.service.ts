import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import { VerificationCode } from './VerificationCode.entity';

@Injectable()
export class AuthService {
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    port: 587,
    secure: false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(VerificationCode)
    private verificationRepo: Repository<VerificationCode>,
  ) {}

  async login(email: string, password: string): Promise<any> {
    const user = await this.userRepo.findOne({
      where: { email },
    });

    if (!user) {
      return { success: false, message: 'Email incorrect' };
    }

    const isPasswordValid = await bcrypt.compare(password, user.motDePasse);

    if (!isPasswordValid) {
      return { success: false, message: 'Mot de passe incorrect' };
    }

    return {
      success: true,
      message: 'Connexion réussie',
      user: {
        id: user.id,
        nomComplet: user.nom,
        email: user.email,
        niveau: user.niveau,
        ecole: user.ecole,
      },
    };
  }

  async register(
    nom: string,
    email: string,
    password: string,
  ): Promise<string> {
    const user = await this.userRepo.findOne({
      where: { email },
    });
    if (user) {
      return 'Utilisateur existe déjà';
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const userCree = this.userRepo.create({
      nom,
      email,
      motDePasse: hashedPassword,
    });
    await this.userRepo.save(userCree);
    return 'ok';
  }

  async VerifierUser(email: string): Promise<string> {
    const user = await this.userRepo.findOne({ where: { email } });
    if (user) {
      return 'Utilisateur existe';
    }
    return 'Utilisateur introuvable';
  }

  async creerCode(email: string) {
    await this.verificationRepo.delete({ email });
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expireEn = new Date();
    expireEn.setMinutes(expireEn.getMinutes() + 10);
    const enreg = this.verificationRepo.create({
      email,
      code,
      expireEn,
    });
    await this.verificationRepo.save(enreg);
    return code;
  }

  async sendCode(email: string, code: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: process.env.MAIL_USER,
        to: email,
        subject: 'Code de vérification',
        text: `Votre code est : ${code}`,
      });
      console.log('EMAIL ENVOYÉ a ', email);
    } catch (err) {
      console.error('ERREUR COMPLETE :', err);
      throw new Error('Email sending failed');
    }
  }

  async envoyerCode(email: string): Promise<string> {
    console.log('EMAIL =', email);
    const resultat = await this.VerifierUser(email);
    if (resultat === 'Utilisateur introuvable') {
      return 'non';
    }
    const code = await this.creerCode(email);
    await this.sendCode(email, code);
    return 'ok';
  }

  async verifyCode(email: string, code: string): Promise<string> {
    const obj = await this.verificationRepo.findOne({
      where: { email, code },
    });
    if (!obj) {
      return 'Code incorrect';
    }
    const now = new Date();
    if (obj.expireEn < now) {
      return 'Code expiré';
    }
    await this.verificationRepo.delete({ email, code });
    return 'ok';
  }

  async changerPassword(email: string, password: string, confirmation: string) {
    if (password !== confirmation) {
      return 'Les mots de passe ne correspondent pas';
    }
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) {
      return 'Utilisateur introuvable';
    }
    const hashed = await bcrypt.hash(password, 10);
    user.motDePasse = hashed;
    await this.userRepo.save(user);
    return 'ok';
  }
}

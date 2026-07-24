import { db } from "./index";
import {
  users,
  channels,
  channelMembers,
  messages,
  directMessages,
  posts,
  postLikes,
  postComments,
} from "./schema";
import bcrypt from "bcryptjs";
import { sql } from "drizzle-orm";

async function seed() {
  console.log("🌱 Seeding database...");

  // Check if data exists
  const existingUsers = await db.select().from(users).limit(1);
  if (existingUsers.length > 0) {
    console.log("Database already seeded, skipping...");
    return;
  }

  const passwordHash = await bcrypt.hash("password123", 12);

  // Create users
  const createdUsers = await db
    .insert(users)
    .values([
      {
        username: "alice_dev",
        displayName: "Alice Martin",
        email: "alice@lycee-dev.fr",
        passwordHash,
        bio: "Passionnée de React & TypeScript 🚀 Terminale SI au Lycée Henri IV",
        location: "Paris, France 🇫🇷",
        techStack: "React, TypeScript, Node.js, Python",
        isOnline: true,
      },
      {
        username: "bob_coder",
        displayName: "Bob Dupont",
        email: "bob@lycee-dev.fr",
        passwordHash,
        bio: "Full-stack en herbe 🌱 J'adore le backend et les bases de données",
        location: "Lyon, France 🇫🇷",
        techStack: "Java, Spring Boot, PostgreSQL",
        isOnline: true,
      },
      {
        username: "clara_web",
        displayName: "Clara Nguyen",
        email: "clara@lycee-dev.fr",
        passwordHash,
        bio: "Designer & développeuse frontend ✨ Première NSI",
        location: "Marseille, France 🇫🇷",
        techStack: "Vue.js, Figma, CSS, Tailwind",
        isOnline: false,
      },
      {
        username: "david_hack",
        displayName: "David Koné",
        email: "david@lycee-dev.fr",
        passwordHash,
        bio: "Cybersécurité & CTF player 🔐 Terminale STMG",
        location: "Toulouse, France 🇫🇷",
        techStack: "Python, Linux, Kali, Burp Suite",
        isOnline: true,
      },
      {
        username: "emma_ai",
        displayName: "Emma Bernard",
        email: "emma@lycee-dev.fr",
        passwordHash,
        bio: "IA & Machine Learning 🤖 Passionnée de maths et d'algo",
        location: "Bordeaux, France 🇫🇷",
        techStack: "Python, TensorFlow, PyTorch, NumPy",
        isOnline: false,
      },
      {
        username: "farid_mobile",
        displayName: "Farid Benali",
        email: "farid@lycee-dev.fr",
        passwordHash,
        bio: "Développeur mobile 📱 React Native & Flutter",
        location: "Nantes, France 🇫🇷",
        techStack: "React Native, Flutter, Dart, Firebase",
        isOnline: true,
      },
      {
        username: "gina_game",
        displayName: "Gina Rossi",
        email: "gina@lycee-dev.fr",
        passwordHash,
        bio: "Game dev 🎮 Unity & Godot, je crée des jeux indés",
        location: "Nice, France 🇫🇷",
        techStack: "C#, Unity, Godot, Blender",
        isOnline: false,
      },
      {
        username: "hugo_ops",
        displayName: "Hugo Moreau",
        email: "hugo@lycee-dev.fr",
        passwordHash,
        bio: "DevOps junior 🐳 Docker & Kubernetes enthusiast",
        location: "Strasbourg, France 🇫🇷",
        techStack: "Docker, Kubernetes, Terraform, AWS",
        isOnline: true,
      },
    ])
    .returning();

  console.log(`✅ Created ${createdUsers.length} users`);

  // Create channels
  const createdChannels = await db
    .insert(channels)
    .values([
      {
        name: "général",
        description:
          "Discussion générale pour tous les lycéens développeurs du monde 🌍",
        emoji: "🌐",
        createdBy: createdUsers[0].id,
      },
      {
        name: "aide-code",
        description:
          "Besoin d'aide sur un bug ? Poste ton code ici et la communauté t'aidera 🐛",
        emoji: "🆘",
        createdBy: createdUsers[1].id,
      },
      {
        name: "projets",
        description: "Partagez vos projets et trouvez des collaborateurs 🚀",
        emoji: "🚀",
        createdBy: createdUsers[0].id,
      },
      {
        name: "frontend",
        description: "React, Vue, Angular, CSS... Tout sur le frontend 🎨",
        emoji: "🎨",
        createdBy: createdUsers[2].id,
      },
      {
        name: "backend",
        description:
          "APIs, bases de données, serveurs... Le monde du backend ⚙️",
        emoji: "⚙️",
        createdBy: createdUsers[1].id,
      },
      {
        name: "ia-ml",
        description:
          "Intelligence artificielle et Machine Learning 🤖",
        emoji: "🤖",
        createdBy: createdUsers[4].id,
      },
      {
        name: "cybersécurité",
        description: "Sécurité informatique, CTF, ethical hacking 🔐",
        emoji: "🔐",
        createdBy: createdUsers[3].id,
      },
      {
        name: "off-topic",
        description: "Discussions hors-sujet, memes, et bonne humeur 😄",
        emoji: "😄",
        createdBy: createdUsers[0].id,
      },
    ])
    .returning();

  console.log(`✅ Created ${createdChannels.length} channels`);

  // Add all users to general channel, and distribute others
  const memberValues = [];
  for (const user of createdUsers) {
    memberValues.push({ channelId: createdChannels[0].id, userId: user.id });
    memberValues.push({
      channelId: createdChannels[7].id,
      userId: user.id,
    });
  }
  // Add specific members to topic channels
  memberValues.push(
    { channelId: createdChannels[1].id, userId: createdUsers[0].id },
    { channelId: createdChannels[1].id, userId: createdUsers[1].id },
    { channelId: createdChannels[1].id, userId: createdUsers[2].id },
    { channelId: createdChannels[2].id, userId: createdUsers[0].id },
    { channelId: createdChannels[2].id, userId: createdUsers[5].id },
    { channelId: createdChannels[3].id, userId: createdUsers[0].id },
    { channelId: createdChannels[3].id, userId: createdUsers[2].id },
    { channelId: createdChannels[4].id, userId: createdUsers[1].id },
    { channelId: createdChannels[4].id, userId: createdUsers[7].id },
    { channelId: createdChannels[5].id, userId: createdUsers[4].id },
    { channelId: createdChannels[5].id, userId: createdUsers[0].id },
    { channelId: createdChannels[6].id, userId: createdUsers[3].id },
    { channelId: createdChannels[6].id, userId: createdUsers[7].id }
  );

  await db.insert(channelMembers).values(memberValues);
  console.log(`✅ Added channel members`);

  // Create messages in general channel
  const now = new Date();
  const msgData = [
    {
      content: "Salut tout le monde ! 👋 Bienvenue sur le réseau des lycéens développeurs !",
      channelId: createdChannels[0].id,
      userId: createdUsers[0].id,
      createdAt: new Date(now.getTime() - 3600000 * 5),
    },
    {
      content: "Hey ! Trop content de voir cette communauté grandir 🎉",
      channelId: createdChannels[0].id,
      userId: createdUsers[1].id,
      createdAt: new Date(now.getTime() - 3600000 * 4.5),
    },
    {
      content: "Quelqu'un bosse sur un projet pour le bac ? On pourrait s'entraider !",
      channelId: createdChannels[0].id,
      userId: createdUsers[3].id,
      createdAt: new Date(now.getTime() - 3600000 * 4),
    },
    {
      content:
        "Moi je prépare un projet en React pour mon dossier NSI, si quelqu'un veut collaborer 🚀",
      channelId: createdChannels[0].id,
      userId: createdUsers[0].id,
      createdAt: new Date(now.getTime() - 3600000 * 3.5),
    },
    {
      content:
        "J'ai découvert Tailwind CSS récemment et c'est un game changer pour le design ! ✨",
      channelId: createdChannels[0].id,
      userId: createdUsers[2].id,
      createdAt: new Date(now.getTime() - 3600000 * 3),
    },
    {
      content: "Quelqu'un a des recommandations de chaînes YouTube pour apprendre le backend ?",
      channelId: createdChannels[0].id,
      userId: createdUsers[5].id,
      createdAt: new Date(now.getTime() - 3600000 * 2),
    },
    {
      content:
        "Je recommande Fireship et Traversy Media, ils sont super pour les débutants 👍",
      channelId: createdChannels[0].id,
      userId: createdUsers[1].id,
      createdAt: new Date(now.getTime() - 3600000 * 1.5),
    },
    {
      content: "On devrait organiser un hackathon en ligne entre lycéens ! Qui est partant ? 🏆",
      channelId: createdChannels[0].id,
      userId: createdUsers[7].id,
      createdAt: new Date(now.getTime() - 3600000),
    },
    {
      content: "OUIII un hackathon ce serait trop cool ! Je suis partante 🙋‍♀️",
      channelId: createdChannels[0].id,
      userId: createdUsers[4].id,
      createdAt: new Date(now.getTime() - 1800000),
    },
    {
      content:
        "Comptez sur moi aussi ! On pourrait le faire sur un weekend 💪",
      channelId: createdChannels[0].id,
      userId: createdUsers[6].id,
      createdAt: new Date(now.getTime() - 900000),
    },
  ];

  // aide-code messages
  msgData.push(
    {
      content:
        "Au secours ! Mon useEffect tourne en boucle infinie, quelqu'un peut m'aider ? 😭\n```js\nuseEffect(() => {\n  setData(fetchData());\n}, [data]);\n```",
      channelId: createdChannels[1].id,
      userId: createdUsers[2].id,
      createdAt: new Date(now.getTime() - 7200000),
    },
    {
      content:
        "Le problème c'est que tu mets `data` dans les dépendances, et tu modifies `data` dans le useEffect. Il faut enlever `data` des deps ou utiliser un autre pattern !",
      channelId: createdChannels[1].id,
      userId: createdUsers[0].id,
      createdAt: new Date(now.getTime() - 7000000),
    },
    {
      content: "Merci Alice ! Ça marche maintenant 🎉",
      channelId: createdChannels[1].id,
      userId: createdUsers[2].id,
      createdAt: new Date(now.getTime() - 6800000),
    }
  );

  await db.insert(messages).values(msgData);
  console.log(`✅ Created ${msgData.length} messages`);

  // Create DMs
  await db.insert(directMessages).values([
    {
      content: "Hey Alice ! Tu as vu mon nouveau projet sur GitHub ?",
      senderId: createdUsers[1].id,
      receiverId: createdUsers[0].id,
      isRead: true,
      createdAt: new Date(now.getTime() - 7200000),
    },
    {
      content: "Oui c'est super ! J'adore l'architecture que tu as choisie 👏",
      senderId: createdUsers[0].id,
      receiverId: createdUsers[1].id,
      isRead: true,
      createdAt: new Date(now.getTime() - 7000000),
    },
    {
      content:
        "Merci ! On devrait collaborer sur un projet ensemble un de ces jours",
      senderId: createdUsers[1].id,
      receiverId: createdUsers[0].id,
      isRead: false,
      createdAt: new Date(now.getTime() - 3600000),
    },
  ]);
  console.log("✅ Created direct messages");

  // Create posts
  const createdPosts = await db
    .insert(posts)
    .values([
      {
        title: "🚀 Mon premier site web déployé !",
        content:
          "Après 3 mois d'apprentissage, j'ai enfin déployé mon portfolio en ligne ! C'est fait avec Next.js et Tailwind CSS. N'hésitez pas à me donner vos retours. Le voyage de 1000 lignes de code commence par un premier commit 😄",
        userId: createdUsers[0].id,
        tags: "nextjs,tailwind,portfolio",
        likesCount: 12,
        createdAt: new Date(now.getTime() - 86400000 * 2),
      },
      {
        title: "Guide : Comment débuter en cybersécurité au lycée 🔐",
        content:
          "Voici les ressources qui m'ont aidé à commencer :\n\n1. **TryHackMe** - Parfait pour les débutants\n2. **OverTheWire** - Pour pratiquer Linux\n3. **PicoCTF** - CTF pour étudiants\n4. **Root-Me** - Plateforme française 🇫🇷\n\nCommencez par les bases de Linux et le réseau, puis passez aux vulnérabilités web. N'hésitez pas si vous avez des questions !",
        userId: createdUsers[3].id,
        tags: "cybersecurite,guide,debutant",
        likesCount: 24,
        createdAt: new Date(now.getTime() - 86400000 * 3),
      },
      {
        title: "Retour d'expérience : Mon stage en entreprise 💼",
        content:
          "J'ai eu la chance de faire un stage de 2 semaines dans une startup tech à Lyon. J'ai appris tellement de choses ! Le travail en équipe avec Git, les code reviews, l'importance des tests... C'est vraiment différent de coder seul dans sa chambre. Je recommande à tout le monde de chercher des stages !",
        userId: createdUsers[1].id,
        tags: "stage,experience,conseil",
        likesCount: 18,
        createdAt: new Date(now.getTime() - 86400000),
      },
      {
        title: "Tutoriel : Créer un chatbot IA avec Python 🤖",
        content:
          "Dans ce tuto, je vous montre comment créer un chatbot simple avec Python et l'API OpenAI. C'est plus facile qu'on ne le pense ! Voici les étapes principales :\n\n1. Installer la librairie `openai`\n2. Configurer votre clé API\n3. Créer une boucle de conversation\n4. Ajouter de la mémoire au bot\n\nLe code complet est sur mon GitHub. Qui veut essayer ?",
        userId: createdUsers[4].id,
        tags: "python,ia,chatbot,tutoriel",
        likesCount: 31,
        createdAt: new Date(now.getTime() - 86400000 * 4),
      },
      {
        title: "Cherche coéquipiers pour un jeu vidéo indie 🎮",
        content:
          "Je développe un petit jeu de plateforme 2D avec Godot et je cherche :\n- Un·e artiste pixel art\n- Un·e musicien·ne\n- Un·e développeur·se pour m'aider avec la physique\n\nLe concept : un jeu de puzzle-platformer sur le thème du code. Chaque niveau est un bug à résoudre ! DM moi si ça vous intéresse 🎯",
        userId: createdUsers[6].id,
        tags: "gamedev,godot,collaboration",
        likesCount: 15,
        createdAt: new Date(now.getTime() - 86400000 * 5),
      },
    ])
    .returning();

  console.log(`✅ Created ${createdPosts.length} posts`);

  // Create post likes
  const likeValues = [];
  for (let i = 0; i < createdUsers.length; i++) {
    for (let j = 0; j < createdPosts.length; j++) {
      if (Math.random() > 0.4) {
        likeValues.push({
          postId: createdPosts[j].id,
          userId: createdUsers[i].id,
        });
      }
    }
  }
  if (likeValues.length > 0) {
    await db.insert(postLikes).values(likeValues);
  }

  // Create comments
  await db.insert(postComments).values([
    {
      content: "Félicitations ! Ton portfolio est vraiment propre 🔥",
      postId: createdPosts[0].id,
      userId: createdUsers[2].id,
      createdAt: new Date(now.getTime() - 86400000),
    },
    {
      content: "Merci pour ce guide, je vais commencer TryHackMe ce weekend !",
      postId: createdPosts[1].id,
      userId: createdUsers[5].id,
      createdAt: new Date(now.getTime() - 86400000 * 2),
    },
    {
      content:
        "Super retour ! Comment tu as trouvé ton stage ? Des conseils ?",
      postId: createdPosts[2].id,
      userId: createdUsers[0].id,
      createdAt: new Date(now.getTime() - 43200000),
    },
    {
      content: "J'ai suivi ton tuto, ça marche super bien ! Merci Emma 🙏",
      postId: createdPosts[3].id,
      userId: createdUsers[0].id,
      createdAt: new Date(now.getTime() - 86400000 * 3),
    },
    {
      content:
        "Le concept du jeu est génial ! Je suis intéressé pour le dev 🎮",
      postId: createdPosts[4].id,
      userId: createdUsers[5].id,
      createdAt: new Date(now.getTime() - 86400000 * 4),
    },
  ]);
  console.log("✅ Created comments");

  // Update likes count
  for (const post of createdPosts) {
    const count = likeValues.filter((l) => l.postId === post.id).length;
    await db
      .update(posts)
      .set({ likesCount: count })
      .where(sql`${posts.id} = ${post.id}`);
  }

  console.log("🎉 Seeding complete!");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seeding error:", err);
    process.exit(1);
  });

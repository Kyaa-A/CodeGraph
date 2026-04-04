// High-quality Unsplash images for the application
// These are free to use and will make the site look professional

export const Images = {
  // Hero/Landing images
  hero: {
    aiLearning: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&q=80&auto=format&fit=crop",
    coding: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&q=80&auto=format&fit=crop",
    technology: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80&auto=format&fit=crop",
  },
  
  // Course category images
  courses: {
    python: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80&auto=format&fit=crop",
    ai: "https://images.unsplash.com/photo-1676299081847-824916de030a?w=800&q=80&auto=format&fit=crop",
    langchain: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80&auto=format&fit=crop",
    database: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&q=80&auto=format&fit=crop",
    webdev: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80&auto=format&fit=crop",
    default: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80&auto=format&fit=crop",
  },
  
  // Feature images
  features: {
    aiTutor: "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=600&q=80&auto=format&fit=crop",
    learning: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=600&q=80&auto=format&fit=crop",
    community: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&q=80&auto=format&fit=crop",
    coding: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&q=80&auto=format&fit=crop",
  },
  
  // Auth pages
  auth: {
    login: "https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&q=80&auto=format&fit=crop",
    signup: "https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1200&q=80&auto=format&fit=crop",
  },
  
  // Abstract backgrounds
  backgrounds: {
    abstract1: "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=1920&q=80&auto=format&fit=crop",
    abstract2: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1920&q=80&auto=format&fit=crop",
    gradient: "https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?w=1920&q=80&auto=format&fit=crop",
    mesh: "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=1920&q=80&auto=format&fit=crop",
  },
  
  // Avatar placeholders
  avatars: {
    user1: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80&auto=format&fit=crop&crop=face",
    user2: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80&auto=format&fit=crop&crop=face",
    user3: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80&auto=format&fit=crop&crop=face",
    user4: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80&auto=format&fit=crop&crop=face",
  },
};

// Get a deterministic image based on course ID
export function getCourseImage(courseId: string): string {
  const images = [
    Images.courses.python,
    Images.courses.ai,
    Images.courses.langchain,
    Images.courses.database,
    Images.courses.webdev,
  ];
  const index = courseId.charCodeAt(0) % images.length;
  return images[index];
}

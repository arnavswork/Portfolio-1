# **App Name**: PrateeqsWork

## Core Features:

- Project Grid: Displays projects in a responsive grid layout, filtering and sorting based on disciplines, and includes placeholder images which can be swapped for real image URLs in the CMS.
- CMS Authentication: Provides email/password authentication via Firebase Auth to secure the CMS dashboard, ensuring only authenticated users can make changes.
- Project Management: Enables creating, editing, publishing/unpublishing, and deleting projects with data stored in Firestore, ensuring all operations update the live site with minimal delay.
- Featured Project Carousel: Creates a horizontally scrolling display of featured projects flagged in Firestore. Fetches and updates data based on changes made in the CMS.
- Discipline Management: Allows adding, editing, and deleting disciplines/categories within the CMS. The updates are immediately reflected in the project filtering and display.
- About Content Editor: Enables editing and publishing content for the About page via a rich text editor in the CMS. Content stored in Firestore is rendered elegantly on the live site.
- Main Page Slideshow: A responsive slideshow on the main page that adapts to different device types. Projects can be added to the slideshow via the CMS dashboard.

## Style Guidelines:

- Primary color: White (#FFFFFF) for a clean and modern feel.
- Secondary color: Light gray (#F0F0F0) provides a subtle contrast.
- Accent color: Medium gray (#808080) for highlights and calls to action.
- Body and headline font: 'Inter' sans-serif provides a modern, clean, neutral aesthetic.
- Minimalist icons: Line-style icons for navigation and UI elements.
- Responsive grid system: CSS Grid/Flexbox to adapt to different screen sizes.
- Smooth transitions: Subtle animations for hover states, filter changes, and mobile menu interactions.
export interface Project {
    id: string;
    title: string;
    slug: string;
    description: string;
    content: string;
    type: string;
    tags: string[];
    githubUrl: string;
    webUrl: string;
    featured: boolean;
    pictures: string[];
}
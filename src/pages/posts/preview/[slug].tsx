import { GetStaticProps } from "next"
import Head from "next/head"
import { RichText } from "prismic-dom"
import { formatPostData } from "../index"
import { getPrismicClient } from "../../../services/prismic"

import styles from '../post.module.scss'
import Link from "next/link"
import { useSession } from "next-auth/client"
import { useEffect } from "react"
import { useRouter } from "next/router"

interface PostPreviewProps {
    post: {
        slug: string;
        title: string;
        content: string;
        updatedAt: string;
    }
}

export default function PostPreview({ post }: PostPreviewProps) {
    const [session]: any = useSession()
    const router = useRouter()

    useEffect(() => {
        if (session?.activeSubscription) {
            router.push(`/posts/${post.slug}`)
        }
    }, [session])
    
    return (
        <>
        <Head>
            <title>{post.title} | Ignews </title>
        </Head>

        <main className={styles.container}>
            <article className={styles.post}>
                <h1>{post.title}</h1>
                <time>{formatPostData(post.updatedAt)}</time>
                <div 
                className={`${styles.postContent} ${styles.previewContent}`}
                dangerouslySetInnerHTML= {{ __html: post.content}} 
                />

                <div className={styles.continueReading}>
                    Wanna continue reading?
                    <Link href="/">
                        <a href="">Subscribe now 🤗</a>
                    </Link>
                </div>
            </article>
        </main>
        </>
    )
}

export const getStaticPaths = () => {
    return {
        paths: [],
        fallback: 'blocking'
    }
}

export const getStaticProps: GetStaticProps = async({ params }) => {
    
    const { slug } = params;

    const prismic = getPrismicClient()

    const response = await prismic.getByUID('publication', String(slug), {})

    const post = {
        slug,
        title: RichText.asText(response.data.title),
        content: RichText.asHtml(response.data.content.splice(0, 1)),
        updatedAt: response.last_publication_date
    };

    return {
        props: {
            post,
        },
        redirect: 60 * 30, // 30 minutes
    }
}
import { GetServerSideProps } from "next"
import { getSession, useSession } from "next-auth/client"
import Head from "next/head"
import { useRouter } from "next/router"
import { RichText } from "prismic-dom"
import { useEffect } from "react"
import { formatPostData } from "."
import { getPrismicClient } from "../../services/prismic"

import styles from './post.module.scss'

interface PostProps {
    post: {
        slug: string;
        title: string;
        content: string;
        updatedAt: string;
    }
}

export default function Post({ post }: PostProps) {
    const [session]: any = useSession();
    const router = useRouter()

    useEffect(() => {
        if (!session?.activeSubscription) {
            router.push(`/posts/preview/${post.slug}`)
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
                className={styles.postContent}
                dangerouslySetInnerHTML= {{ __html: post.content}} />
            </article>
        </main>
        </>
    )
}

export const getServerSideProps: GetServerSideProps = async({ req, params }) => {
    const session: any = await getSession({ req })
    const { slug } = params;

    // console.log(session.activeSubscription)

    // if (!session?.activeSubscription) {
    //     return {
    //         redirect: {
    //             destination: `'/preview/${post.slug}'`,
    //             permanent: false,
    //         }
    //     }
    // }

    const prismic = getPrismicClient(req)

    const response = await prismic.getByUID('publication', String(slug), {})

    const post = {
        slug,
        title: RichText.asText(response.data.title),
        content: RichText.asHtml(response.data.content),
        updatedAt: response.last_publication_date
    };

    return {
        props: {
            post,
        }
    }
}
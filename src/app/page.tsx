import Container from '@/components/Container';
import Jumbotron from '@/components/Home/Jumbotron';
import Section from '@/components/Home/Section';
import PostList from '@/components/Home/PostList';
import styles from './page.module.scss';

export default function Home() {
  return (
    <main>
      <Jumbotron />
      <Container>
        <div className={styles.sections}>
          <Section title="Blog">
            <PostList />
          </Section>
        </div>
      </Container>
    </main>
  );
}

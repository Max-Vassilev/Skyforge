import { Button } from '../components/ui';

export default function NotFound() {
  return (
    <div className="not-found">
      <span className="not-found__code">404</span>
      <h1>Lost signal</h1>
      <p className="not-found__msg">
        The page you&rsquo;re looking for has drifted out of range. Let&rsquo;s get you
        back on course.
      </p>
      <Button to="/" variant="primary" size="lg">
        Back home
      </Button>
    </div>
  );
}

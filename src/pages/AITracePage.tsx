import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import Layout from '../components/ui/Layout';
import AITracePanel from '../components/loggedIn/AITracePanel';

const Container = styled.div`
  display: flex;
  width: 100%;
  height: 100vh;
`;

const AITracePage = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const groupIdNumber = groupId ? parseInt(groupId, 10) : undefined;

  if (!groupIdNumber || isNaN(groupIdNumber)) {
    return (
      <Layout hideNavbar>
        <Container>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', color: 'var(--error-red)' }}>
            Invalid group ID
          </div>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout hideNavbar>
      <Container>
        <AITracePanel groupId={groupIdNumber} />
      </Container>
    </Layout>
  );
};

export default AITracePage;

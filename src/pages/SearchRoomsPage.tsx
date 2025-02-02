import UserLayout from "../components/loggedIn/UserLayout";
import SearchRooms from "../components/loggedIn/SearchRooms";

const SearchRoomsPage = () => {
  return (
    <>
      <UserLayout>
        <SearchRooms />
      </UserLayout>
    </>
  );
};

export default SearchRoomsPage;

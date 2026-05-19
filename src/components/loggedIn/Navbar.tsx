import { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import LabeledInputWithCount from "../ui/Input";
import { CiSearch } from "react-icons/ci";
import { FiMenu, FiChevronDown } from "react-icons/fi";
import { useRoomContext } from "./RoomContext";
import { useTranslation } from "react-i18next";
import { useLanguage, type Language } from "../../contexts/LanguageContext";
import { UserProfile, ProfileBackdrop } from "./UserProfile";

const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 4rem;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 1000;
  border-bottom: 1px solid var(--color-line);
  box-sizing: border-box;
  
  /* tablet >= 768px */
  @media (min-width: 48rem) {
    left: 14rem;
    width: calc(100vw - 14rem);
    height: 4.5rem;
    border-left: 1px solid var(--color-line);
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    left: 16rem;
    width: calc(100vw - 16rem);
    height: 5rem;
    border-left: 1px solid var(--color-line);
  }
`;

const MenuButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  padding: var(--space-3);
  margin-left: var(--space-3);
  cursor: pointer;
  color: var(--slate-grey);
  font-size: var(--space-6);
  
  @media (min-width: 48rem) {
    display: none;
  }
  
  &:hover {
    color: var(--emerald-green);
  }
`;

// RightContainer（将其挪到右侧）
const RightContainer = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  gap: var(--space-3);
  margin-left: auto;
  margin-right: var(--space-4);
  
  @media (min-width: 48rem) {
    gap: var(--space-4);
    margin-right: var(--space-8);
  }
`;

const LangSwitcherWrapper = styled.div`
  position: relative;
`;

const LangToggle = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-1);
  padding: var(--space-2) var(--space-3);
  background: var(--white);
  // border: 1px solid var(--color-line);
  border-radius: var(--radius-5);
  font-family: var(--font-sans);
  font-size: var(--space-3);
  font-weight: var(--weight-medium);
  color: var(--slate-grey);
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 4rem;
  height: 2.25rem;
  outline: none;

  &:hover {
    border-color: var(--emerald-green);
    color: var(--emerald-green);
  }

  &:focus {
    outline: none;
  }

  @media (min-width: 48rem) {
    font-size: var(--space-4);
    padding: var(--space-2) var(--space-4);
    height: 2.5rem;
    min-width: 4.5rem;
  }
`;

const LangDropdown = styled.div`
  position: absolute;
  top: calc(100% + var(--space-2));
  right: 0;
  width: 10rem;
  background-color: var(--white);
  border: 1px solid var(--white);
  border-radius: var(--radius-5);
  padding: 0.75rem;
  box-shadow: 10px 15px 50px 0px rgba(113,128,150,0.08);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  z-index: 1001;
`;

const LangOption = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  padding: 0 var(--space-3);
  width: 100%;
  height: var(--space-7);
  gap: var(--space-2);
  background: ${({ $active }) => ($active ? 'var(--color-line)' : 'var(--white)')};
  border: none;
  border-radius: var(--radius-5);
  font-family: var(--font-sans);
  font-size: var(--space-3);
  font-weight: var(--weight-medium);
  color: ${({ $active }) => ($active ? 'var(--emerald-green)' : 'var(--slate-grey)')};
  cursor: pointer;
  text-align: left;
  transition: background-color 0.2s ease, transform 0.1s ease;
  box-sizing: border-box;

  &:hover {
    background-color: var(--color-line);
    color: var(--emerald-green);
  }

  &:focus {
    outline: none;
  }

  @media (min-width: 48rem) {
    font-size: var(--space-4);
    height: var(--space-8);
  }
`;




const SearchContainer = styled.div`
  /* mobile - 基础样式 */
  width: 12rem;
  height: 2.5rem;
  padding: var(--space-3) var(--space-4);
  background-color: var(--input-bg);
  border-radius: var(--radius-5);
  display: inline-flex;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    width: 16rem;
    height: 3rem;
    padding: var(--space-5);
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    width: 20rem;
  }

  /* large desktop >= 1280px */
  @media (min-width: 80rem) {
    width: 24rem;
  }
`;

const SearchWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: var(--space-4);
  height: 100%;
  flex: 1;
  margin: 0;
  position: relative;
`;

const SearchIcon = styled(CiSearch)`
  position: static;
  transform: none;
  font-size: var(--space-5);
  color: var(--input);          /* slate-400 */
  z-index: 1;
`;

interface NavbarProps {
  onMenuClick?: () => void;
}

function Navbar({ onMenuClick }: NavbarProps) {
  const { t } = useTranslation();
  const { language, setLanguage, languages } = useLanguage();
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const { setMainAreaRoomListRequest, mainAreaRoomsPagination } = useRoomContext();

  // 点击外部关闭语言下拉
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setLangOpen(false);
      }
    };
    if (langOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [langOpen]);

  const currentLangLabel =
    languages.find((l) => l.code === language)?.label ?? language;

  // 新增：导航栏搜索关键字状态与事件
  const [navSearchKeyword, setNavSearchKeyword] = useState("");
  const handleNavSearchChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    if (value.length <= 100) {
      setNavSearchKeyword(value);
      setMainAreaRoomListRequest({
        keyword: value,
        groupDemonTypeEnum: "PUBLICROOM",
        pageRequestVO: {
          pageSize: mainAreaRoomsPagination?.pageSize ?? 20,
          pageNum: 1,
        },
      });
    }
  };



  return (
    <Container>
      {profileOpen && (
        <ProfileBackdrop onClick={() => setProfileOpen(false)} />
      )}
      <MenuButton onClick={onMenuClick} aria-label={t('navbar.openSidebar')}>
        <FiMenu size={24} />
      </MenuButton>
      <RightContainer>
        <SearchContainer>
          <SearchWrapper>
            <SearchIcon />
            <LabeledInputWithCount
              variant="unstyled"
              value={navSearchKeyword}
              onChange={handleNavSearchChange}
              placeholder={t('navbar.searchPlaceholder')}
              type="text"
              showCount={false}
            />
          </SearchWrapper>
        </SearchContainer>
        <VerticalDivider />
        <LangSwitcherWrapper ref={langRef}>
          <LangToggle onClick={() => setLangOpen((v) => !v)}>
            {currentLangLabel}
            <FiChevronDown
              size={14}
              style={{
                transform: langOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s ease",
              }}
            />
          </LangToggle>
          {langOpen && (
            <LangDropdown>
              {languages.map((lang) => (
                <LangOption
                  key={lang.code}
                  $active={language === lang.code}
                  onClick={() => {
                    setLanguage(lang.code as Language);
                    setLangOpen(false);
                  }}
                >
                  {lang.label}
                </LangOption>
              ))}
            </LangDropdown>
          )}
        </LangSwitcherWrapper>
        <UserProfile />
      </RightContainer>
    </Container>
  );
}

export default Navbar;

const VerticalDivider = styled.div`
  width: var(--space-1);
  height: var(--space-6);
  border-left: 1px solid  var(--border-d9d9d970);
`;

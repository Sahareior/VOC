'use client';

import React, { useCallback, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, BookDownIcon, FileQuestion, Speaker, User, Menu, X, Speech, LogOut, Settings, Key, UserCircle, LayoutDashboard } from 'lucide-react';
import Image from 'next/image';
import logo from '../../public/logo.png';
import { useUser } from '../../contexts/UserContext';
import { WordModal } from '../features/WordModal';
import { Avatar, Dropdown } from 'antd';
import { UserOutlined, LockOutlined, LogoutOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { selectIsAuthenticated, selectCurrentUser, logout as logoutAction } from '../../redux/slices/authSlice';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { allData, isFavorite, toggleLearned, toggleFavorite, searchQuery, setSearchQuery, activeSort, setActiveSort } = useUser();
  const dispatch = useDispatch();
  const isLoggedIn = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);
  const userName = user?.name || user?.email || 'User';

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedWord, setSelectedWord] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  /* ---------------- Word Modal Logic ---------------- */

  const handleOpenModal = useCallback(() => {
    if (allData && allData.length > 0) {
      setSelectedWord(allData[0]);
      setIsModalOpen(true);
    }
  }, [allData]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedWord(null);
  };

  const getCurrentIndex = () => {
    if (!selectedWord || !allData) return -1;
    return allData.findIndex(w => w.id === selectedWord.id);
  };

  const onNext = (currentIndex) => {
    if (currentIndex < allData.length - 1) {
      setSelectedWord(allData[currentIndex + 1]);
    }
  };

  const onPrevious = (currentIndex) => {
    if (currentIndex > 0) {
      setSelectedWord(allData[currentIndex - 1]);
    }
  };

  /* ---------------- Navigation ---------------- */

  // Filter navigation based on login status
  const getNavigation = () => {
    const baseNav = [
      { name: 'Quiz', href: '/quiz', icon: FileQuestion },
    ];

    // Add Groups and Dashboard only if logged in
    if (isLoggedIn) {
      baseNav.unshift({ name: 'Groups', href: '/groups', icon: BookDownIcon });
      baseNav.unshift({ name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard });
    }

    return baseNav;
  };

  const isActive = (href) => pathname?.startsWith(href);

  /* ---------------- Search Handlers ---------------- */

  const handleSearch = () => {
    if (pathname !== '/') {
      router.push(`/?search=${searchQuery}`);
    }
  };

  const handleSort = (type) => {
    setActiveSort(type);
    if (pathname !== '/') {
      router.push(`/?sort=${type}`);
    }
  };

  /* ---------------- Profile Dropdown Handlers ---------------- */

  const handleProfileClick = () => {
    router.push('/profile');
    setMobileMenuOpen(false);
  };

  const handleChangePasswordClick = () => {
    router.push('/change-password');
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    dispatch(logoutAction());
    router.push('/login');
    setMobileMenuOpen(false);
  };

  // Profile dropdown menu items
  const profileMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
      onClick: handleProfileClick,
    },
    {
      key: 'change-password',
      icon: <LockOutlined />,
      label: 'Change Password',
      onClick: handleChangePasswordClick,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
      danger: true,
    },
  ];

  const navigation = getNavigation();

  return (
    <div>
      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-50 w-full bg-white shadow-lg border-b py-1 border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between">

            {/* LEFT SIDE */}
            <div className="flex items-center gap-4 sm:gap-8">
              <Link href="/" className="flex items-center">
                <Image
                  src={logo}
                  alt="Logo"
                  width={140}
                  height={44}
                  className="sm:w-[190px] sm:h-[60px]"
                  priority
                />
              </Link>

              <nav className="hidden md:flex items-center gap-4 lg:gap-6 text-sm lg:text-base font-bold">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center gap-1 transition whitespace-nowrap ${active
                        ? 'text-blue-600'
                        : 'text-blue-600 hover:underline'
                        }`}
                    >
                      <Icon className="w-4 h-4 hidden" />
                      {item.name}
                    </Link>
                  );
                })}
                <button
                  onClick={handleOpenModal}
                  className="p-2 rounded-md flex items-center gap-2 bg-red-100 hover:bg-gray-100 whitespace-nowrap"
                >
                  <Speech className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                  <span className="hidden lg:inline">Audio</span>
                </button>
              </nav>
            </div>

            {/* RIGHT SIDE */}
            <div className="hidden md:flex items-center gap-4 lg:gap-6">

              {/* Sort Buttons - Only show on home page */}
              {pathname === '/' && (
                <div className="flex items-center border font-bold border-yellow-500 rounded-full overflow-hidden">
                  <button
                    onClick={() => handleSort('random')}
                    className={`px-3 lg:px-4 py-2 text-xs lg:text-sm font-semibold transition-colors ${activeSort === 'random'
                      ? 'bg-orange-500 text-white'
                      : 'text-red-600 hover:bg-gray-50'
                      }`}
                  >
                    Random
                  </button>
                  <button
                    onClick={() => handleSort('az')}
                    className={`px-3 lg:px-4 py-2 text-xs lg:text-sm font-semibold border-l border-yellow-500 transition-colors ${activeSort === 'az'
                      ? 'bg-orange-500 text-white'
                      : 'text-red-600 hover:bg-gray-50'
                      }`}
                  >
                    A-Z
                  </button>
                  <button
                    onClick={() => handleSort('id')}
                    className={`px-3 lg:px-4 py-2 text-xs lg:text-sm font-semibold border-l border-yellow-500 transition-colors ${activeSort === 'id'
                      ? 'bg-orange-500 text-white'
                      : 'text-red-600 hover:bg-gray-50'
                      }`}
                  >
                    Newest
                  </button>
                </div>
              )}

              {/* Search - Hide on smaller desktop screens */}
              <div className="hidden lg:flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Search words..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-48 xl:w-64 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400"
                />
                <button
                  onClick={handleSearch}
                  className="px-4 py-2 text-sm font-semibold text-green-700 border border-green-700 rounded-md hover:bg-green-50 transition whitespace-nowrap"
                >
                  Search
                </button>
              </div>

              {/* Profile Avatar - Only show when logged in */}
              {isLoggedIn ? (
                <Dropdown
                  menu={{ items: profileMenuItems }}
                  placement="bottomRight"
                  arrow
                  trigger={['click']}
                >
                  <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition">
                    <Avatar
                      size={40}
                      icon={<UserOutlined />}
                      className="bg-blue-500 flex-shrink-0"
                    />
                  </div>
                </Dropdown>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition whitespace-nowrap"
                >
                  <User className="w-4 h-4" />
                  <span>Sign In</span>
                </Link>
              )}
            </div>

            {/* MOBILE MENU BUTTON */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* ================= MOBILE MENU ================= */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-white pt-20 overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* Mobile Navigation */}
            <nav className="flex flex-col space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 p-3 rounded-lg transition ${active ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}

              {/* Audio Button in Mobile */}
              <button
                onClick={() => {
                  handleOpenModal();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                <Speech className="w-5 h-5" />
                <span className="font-medium">Audio</span>
              </button>

              {/* Sort Options in Mobile (only on home) */}
              {pathname === '/' && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-500 mb-2">Sort by:</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        handleSort('random');
                        setMobileMenuOpen(false);
                      }}
                      className={`flex-1 px-3 py-2 text-sm font-semibold rounded-md transition ${activeSort === 'random'
                        ? 'bg-orange-500 text-white'
                        : 'bg-white text-red-600 border border-yellow-500'
                        }`}
                    >
                      Random
                    </button>
                    <button
                      onClick={() => {
                        handleSort('az');
                        setMobileMenuOpen(false);
                      }}
                      className={`flex-1 px-3 py-2 text-sm font-semibold rounded-md transition ${activeSort === 'az'
                        ? 'bg-orange-500 text-white'
                        : 'bg-white text-red-600 border border-yellow-500'
                        }`}
                    >
                      A-Z
                    </button>
                    <button
                      onClick={() => {
                        handleSort('id');
                        setMobileMenuOpen(false);
                      }}
                      className={`flex-1 px-3 py-2 text-sm font-semibold rounded-md transition ${activeSort === 'id'
                        ? 'bg-orange-500 text-white'
                        : 'bg-white text-red-600 border border-yellow-500'
                        }`}
                    >
                      Newest
                    </button>
                  </div>
                </div>
              )}

              {/* Mobile Profile Options when logged in */}
              {isLoggedIn ? (
                <>
                  <div className="border-t border-gray-200 my-2"></div>
                  <div className="px-3 py-2">
                    <p className="text-sm text-gray-500 mb-2">Signed in as:</p>
                    <p className="text-sm font-medium text-gray-700 mb-3">{userName}</p>
                  </div>
                  <button
                    onClick={handleProfileClick}
                    className="flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    <UserCircle className="w-5 h-5" />
                    <span className="font-medium">Profile</span>
                  </button>
                  <button
                    onClick={handleChangePasswordClick}
                    className="flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    <Key className="w-5 h-5" />
                    <span className="font-medium">Change Password</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 p-3 rounded-lg text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <div className="border-t border-gray-200 my-2"></div>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-lg text-blue-600 hover:bg-blue-50"
                  >
                    <User className="w-5 h-5" />
                    <span className="font-medium">Sign In</span>
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-lg text-green-600 hover:bg-green-50"
                  >
                    <User className="w-5 h-5" />
                    <span className="font-medium">Register</span>
                  </Link>
                </>
              )}
            </nav>

            {/* Mobile Search */}
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-500 mb-2">Search words:</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Enter search term..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400"
                />
                <button
                  onClick={() => {
                    handleSearch();
                    setMobileMenuOpen(false);
                  }}
                  className="px-4 py-2 text-sm font-semibold text-green-700 border border-green-700 rounded-md hover:bg-green-50 transition whitespace-nowrap"
                >
                  Go
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= WORD MODAL ================= */}
      <WordModal
        locationPath="header"
        word={selectedWord}
        onNext={() => onNext(getCurrentIndex())}
        onPrevious={() => onPrevious(getCurrentIndex())}
        isOpen={isModalOpen}
        isFavorite={selectedWord ? isFavorite(String(selectedWord.id)) : false}
        onClose={handleCloseModal}
        onToggleFavorite={toggleFavorite}
        onToggleLearned={toggleLearned}
        currentIndex={getCurrentIndex()}
        totalWords={allData ? allData.length : 0}
      />
    </div>
  );
}
'use client';

import React, { useCallback, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, BookDownIcon, FileQuestion, Speaker, User, Menu, X, Speech } from 'lucide-react';
import Image from 'next/image';
import logo from '../../public/logo.png';
import { useUser } from '../../contexts/UserContext';
import { WordModal } from '../features/WordModal';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { allData, isFavorite, toggleLearned, toggleFavorite } = useUser();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedWord, setSelectedWord] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');

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

  const navigation = [
    { name: 'Groups', href: '/groups', icon: BookDownIcon },
    { name: 'Quiz', href: '/quiz', icon: FileQuestion },
    { name: 'Login', href: '/login', icon: User },
    { name: 'Register', href: '/register', icon: User },
  ];

  const isActive = (href) => pathname.startsWith(href);

  /* ---------------- Search Handlers ---------------- */

  const handleSearch = () => {
    if (!search.trim()) return;
    router.push(`/search?q=${search}`);
  };

  const handleSort = (type) => {
    router.push(`/?sort=${type}`);
  };

  return (
    <div>
      {/* ================= HEADER ================= */}
      <header className="w-full bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex h-16 items-center justify-between">

            {/* LEFT SIDE */}
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center">
                <Image
                  src={logo}
                  alt="Logo"
                  width={150}
                  height={40}
                  priority
                />
              </Link>

              <nav className="hidden md:flex items-center gap-6 text-sm font-semibold">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center gap-1 transition ${
                        active
                          ? 'text-blue-600'
                          : 'text-blue-600 hover:underline'
                      }`}
                    >
                      <Icon className="w-4 h-4 hidden" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* RIGHT SIDE */}
            <div className="hidden md:flex items-center gap-6">

              {/* Sort Buttons */}
              <div className="flex items-center border border-gray-300 rounded-full overflow-hidden">
                <button
                  onClick={() => handleSort('random')}
                  className="px-4 py-1.5 bg-orange-500 text-white text-sm font-semibold"
                >
                  Random
                </button>
                <button
                  onClick={() => handleSort('az')}
                  className="px-4 py-1.5 text-sm font-semibold text-red-600 hover:bg-gray-50"
                >
                  A-Z
                </button>
                <button
                  onClick={() => handleSort('newest')}
                  className="px-4 py-1.5 text-sm font-semibold text-red-600 hover:bg-gray-50"
                >
                  Newest
                </button>
              </div>

              {/* Search */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-64 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400"
                />
                <button
                  onClick={handleSearch}
                  className="px-4 py-2 text-sm font-semibold text-green-700 border border-green-700 rounded-md hover:bg-green-50 transition"
                >
                  Search
                </button>
              </div>

              {/* Speech Button */}
              <button
                onClick={handleOpenModal}
                className="p-2 rounded-md hover:bg-gray-100"
              >
                <Speech className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* MOBILE MENU BUTTON */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2"
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>

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
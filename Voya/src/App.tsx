/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Car, Agency, Reservation, User, Review, Notification } from "./types";
import { INITIAL_CARS, INITIAL_AGENCIES, INITIAL_USER, INITIAL_NOTIFICATIONS, INITIAL_REVIEWS } from "./data";
import PhoneContainer from "./components/PhoneContainer";
import BottomNav from "./components/BottomNav";
import ExploreTab from "./components/ExploreTab";
import AgenciesTab from "./components/AgenciesTab";
import FavoritesTab from "./components/FavoritesTab";
import BookingsTab from "./components/BookingsTab";
import HostTab from "./components/HostTab";
import ProfileTab from "./components/ProfileTab";
import HostTrips from "./components/HostTrips";
import HostInbox from "./components/HostInbox";
import HostVehicles from "./components/HostVehicles";
import HostDashboard from "./components/HostDashboard";
import HostAccount from "./components/HostAccount";
import NotificationPanel from "./components/NotificationPanel";
import LoginSignup from "./components/LoginSignup";
import { AnimatePresence, motion } from "motion/react";
import { useLanguage } from "./LanguageContext";

export default function App() {
  const { dir, isRtl } = useLanguage();
  const [currentTab, setCurrentTab] = useState<string>("explore");
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [hideBottomNav, setHideBottomNav] = useState<boolean>(false);
  
  const [isHostMode, setIsHostMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("turo_dz_host_mode");
    return saved === "true";
  });
  const [selectedHostTripId, setSelectedHostTripId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem("turo_dz_host_mode", String(isHostMode));
  }, [isHostMode]);

  const handleToggleHostMode = () => {
    setIsHostMode(prev => {
      const next = !prev;
      setCurrentTab(next ? "host_dashboard" : "explore");
      return next;
    });
  };
  
  // Login modal overlay state
  const [showLoginSignup, setShowLoginSignup] = useState<boolean>(() => {
    const saved = localStorage.getItem("turo_dz_user");
    if (!saved) return true;
    try {
      const parsed = JSON.parse(saved);
      return !!parsed.isGuest;
    } catch {
      return true;
    }
  });

  // Cars State (Persisted)
  const [cars, setCars] = useState<Car[]>(() => {
    const saved = localStorage.getItem("turo_dz_cars");
    if (saved) {
      try {
        const parsed: Car[] = JSON.parse(saved);
        const parsedIds = new Set(parsed.map(c => c.id));
        const newCars = INITIAL_CARS.filter(c => !parsedIds.has(c.id));
        if (newCars.length > 0) {
          return [...parsed, ...newCars];
        }
        return parsed;
      } catch (e) {
        return INITIAL_CARS;
      }
    }
    return INITIAL_CARS;
  });

  // User State (Persisted)
  const [user, setUser] = useState<User>(() => {
    const isFirstTimeGuestMode = !localStorage.getItem("turo_dz_guest_mode_forced_v1");
    if (isFirstTimeGuestMode) {
      localStorage.setItem("turo_dz_guest_mode_forced_v1", "true");
      localStorage.removeItem("turo_dz_user");
      return INITIAL_USER;
    }
    const saved = localStorage.getItem("turo_dz_user");
    return saved ? JSON.parse(saved) : INITIAL_USER;
  });

  // Reservations State (Persisted)
  const [bookings, setBookings] = useState<Reservation[]>(() => {
    const saved = localStorage.getItem("turo_dz_bookings");
    return saved ? JSON.parse(saved) : [];
  });

  // Notifications State (Persisted)
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem("turo_dz_notifs");
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  // Reviews list State (Persisted)
  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem("turo_dz_reviews");
    return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
  });

  // Sync state triggers
  useEffect(() => {
    localStorage.setItem("turo_dz_cars", JSON.stringify(cars));
  }, [cars]);

  useEffect(() => {
    localStorage.setItem("turo_dz_user", JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem("turo_dz_bookings", JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem("turo_dz_notifs", JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem("turo_dz_reviews", JSON.stringify(reviews));
  }, [reviews]);

  // Handle addition & update state actions
  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const handleAddBooking = (newBooking: Reservation) => {
    setBookings((prev) => [newBooking, ...prev]);
  };

  const handleUpdateBookingStatus = (id: string, status: Reservation["status"]) => {
    setBookings((prev) => 
      prev.map(b => b.id === id ? { ...b, status } : b)
    );
  };

  const handleAddCar = (newCar: Car) => {
    setCars((prev) => [newCar, ...prev]);
  };

  const handleDeleteCar = (id: string) => {
    setCars((prev) => prev.filter(c => c.id !== id));
  };

  const handleToggleAvailability = (id: string) => {
    setCars((prev) => 
      prev.map(c => c.id === id ? { ...c, isAvailable: !c.isAvailable } : c)
    );
  };

  const handleAddNotification = (newNotif: Notification) => {
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const handleAddReview = (newReview: Review) => {
    setReviews((prev) => [newReview, ...prev]);
    // Also update average rating of the car
    setCars((prevCars) => 
      prevCars.map(car => {
        if (car.id === newReview.carId) {
          const currentTotalStars = car.rating * car.reviewsCount;
          const newReviewsCount = car.reviewsCount + 1;
          const newAvgRating = parseFloat(((currentTotalStars + newReview.rating) / newReviewsCount).toFixed(1));
          return {
            ...car,
            rating: newAvgRating,
            reviewsCount: newReviewsCount
          };
        }
        return car;
      })
    );
  };

  const handleMarkAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map(n => ({ ...n, read: true })));
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  const handleSelectCarForExplore = (car: Car) => {
    // Force active tab to explore and pass a focus trigger
    setCurrentTab("explore");
    // A micro timeout triggers clicking selection simulation
    setTimeout(() => {
      const card = document.getElementById("brand-search");
      if (card) {
        (card as HTMLInputElement).value = car.brand;
        card.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }, 100);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <PhoneContainer 
      unreadNotifications={unreadCount}
      onOpenNotifications={() => setIsNotificationsOpen(true)}
    >
      <div className={`w-full h-full relative font-sans select-none ${isRtl ? "text-right" : "text-left"}`} dir={dir}>
        {/* Main Tab Render Space with Animation */}
        <AnimatePresence mode="wait">
          {currentTab === "explore" && (
            <motion.div
              key="explore"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full"
            >
              <ExploreTab 
                cars={cars} 
                user={user}
                onUpdateUser={handleUpdateUser}
                onAddBooking={handleAddBooking}
                onAddNotification={handleAddNotification}
                onSetHideBottomNav={setHideBottomNav}
                onShowLoginSignup={() => setShowLoginSignup(true)}
              />
            </motion.div>
          )}

          {currentTab === "agencies" && (
            <motion.div
              key="agencies"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full"
            >
              <FavoritesTab 
                cars={cars}
                onSelectCar={handleSelectCarForExplore}
                onChangeTab={setCurrentTab}
                onSetHideBottomNav={setHideBottomNav}
              />
            </motion.div>
          )}

          {currentTab === "bookings" && (
            <motion.div
              key="bookings"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full"
            >
              <BookingsTab 
                bookings={bookings}
                user={user}
                onUpdateUser={handleUpdateUser}
                onUpdateBookingStatus={handleUpdateBookingStatus}
                onAddNotification={handleAddNotification}
                onAddReview={handleAddReview}
                onChangeTab={setCurrentTab}
                onSetHideBottomNav={setHideBottomNav}
                agencies={INITIAL_AGENCIES}
                cars={cars}
                onSelectCar={handleSelectCarForExplore}
                onShowLoginSignup={() => setShowLoginSignup(true)}
              />
            </motion.div>
          )}

          {currentTab === "host" && (
            <motion.div
              key="host"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full"
            >
              <HostTab 
                cars={cars}
                user={user}
                onAddCar={handleAddCar}
                onDeleteCar={handleDeleteCar}
                onToggleAvailability={handleToggleAvailability}
                onAddNotification={handleAddNotification}
                onSetHideBottomNav={setHideBottomNav}
                onShowLoginSignup={() => setShowLoginSignup(true)}
              />
            </motion.div>
          )}

          {currentTab === "profile" && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full"
            >
              <ProfileTab 
                user={user}
                onUpdateUser={handleUpdateUser}
                onAddNotification={handleAddNotification}
                onSetHideBottomNav={setHideBottomNav}
                onChangeTab={setCurrentTab}
                onShowLoginSignup={() => setShowLoginSignup(true)}
                onToggleHostMode={handleToggleHostMode}
              />
            </motion.div>
          )}

          {/* Host Mode Tabs */}
          {currentTab === "host_trips" && (
            <motion.div
              key="host_trips"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full"
            >
              <HostTrips 
                bookings={bookings}
                cars={cars}
                onUpdateBookingStatus={handleUpdateBookingStatus}
                onAddNotification={handleAddNotification}
                selectedTripId={selectedHostTripId}
                onSelectTrip={setSelectedHostTripId}
              />
            </motion.div>
          )}

          {currentTab === "host_inbox" && (
            <motion.div
              key="host_inbox"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full"
            >
              <HostInbox 
                onAddNotification={handleAddNotification}
                onSetHideBottomNav={setHideBottomNav}
              />
            </motion.div>
          )}

          {currentTab === "host_vehicles" && (
            <motion.div
              key="host_vehicles"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full"
            >
              <HostVehicles 
                cars={cars}
                onAddCar={handleAddCar}
                onDeleteCar={handleDeleteCar}
                onToggleAvailability={handleToggleAvailability}
                onAddNotification={handleAddNotification}
              />
            </motion.div>
          )}

          {currentTab === "host_dashboard" && (
            <motion.div
              key="host_dashboard"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full"
            >
              <HostDashboard 
                cars={cars}
                bookings={bookings}
                onSelectTrip={(tripId) => {
                  setSelectedHostTripId(tripId);
                  setCurrentTab("host_trips");
                }}
                onNavigateToTab={setCurrentTab}
              />
            </motion.div>
          )}

          {currentTab === "host_account" && (
            <motion.div
              key="host_account"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full"
            >
              <HostAccount 
                user={user}
                cars={cars}
                bookings={bookings}
                onUpdateUser={handleUpdateUser}
                onAddNotification={handleAddNotification}
                onToggleHostMode={handleToggleHostMode}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Bottom Navigation Bar */}
        {!hideBottomNav && (
          <BottomNav 
            currentTab={currentTab} 
            isHostMode={isHostMode}
            onChangeTab={(tabId) => {
              if (user.isGuest && (tabId === "agencies" || tabId === "bookings" || tabId === "host")) {
                setShowLoginSignup(true);
              } else {
                setCurrentTab(tabId);
              }
            }}
            unreadNotifications={unreadCount}
          />
        )}

        {/* Global Slide-Over Notification Center Panel */}
        <NotificationPanel 
          notifications={notifications}
          isOpen={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
          onMarkAllAsRead={handleMarkAllNotificationsAsRead}
          onClearNotifications={handleClearNotifications}
        />

        {/* Global Login / Sign-up Overlay */}
        <AnimatePresence>
          {showLoginSignup && (
            <LoginSignup 
              onLogin={(registeredUser) => {
                handleUpdateUser(registeredUser);
                setShowLoginSignup(false);
              }}
              onClose={() => setShowLoginSignup(false)}
              allowGuest={true}
            />
          )}
        </AnimatePresence>
      </div>
    </PhoneContainer>
  );
}

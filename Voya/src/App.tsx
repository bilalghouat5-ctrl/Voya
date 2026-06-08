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
import BookingsTab from "./components/BookingsTab";
import HostTab from "./components/HostTab";
import ProfileTab from "./components/ProfileTab";
import NotificationPanel from "./components/NotificationPanel";
import { AnimatePresence, motion } from "motion/react";

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>("explore");
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [hideBottomNav, setHideBottomNav] = useState<boolean>(false);

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
      <div className="w-full h-full relative font-sans text-right select-none" dir="rtl">
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
              <AgenciesTab 
                agencies={INITIAL_AGENCIES} 
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
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Bottom Navigation Bar */}
        {!hideBottomNav && (
          <BottomNav 
            currentTab={currentTab} 
            onChangeTab={setCurrentTab} 
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
      </div>
    </PhoneContainer>
  );
}

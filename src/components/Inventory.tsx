import React from 'react';
import { Button } from './ui/button';
import { NFT } from '../types';

interface InventoryProps {
  onPageChange: (page: 'pvp' | 'rolls' | 'inventory' | 'shop' | 'earn') => void;
  currentPage: 'pvp' | 'rolls' | 'inventory' | 'shop' | 'earn';
  userGifts: NFT[];
  totalTON: number;
}

export const Inventory: React.FC<InventoryProps> = ({ onPageChange, currentPage, userGifts, totalTON }) => {
  return (
                                                                               <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#020817' }}>
             {/* Clean Background - No white spots */}

                                                                                                               {/* Top Status Bar - Compact */}
          <div className="flex justify-center mb-4 mt-4">
            <div className="bg-card border border-border rounded-lg px-2 py-1 inline-block">
              <div className="flex items-center justify-center">
                {/* Game Stats */}
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <span className="text-base font-semibold text-white">
                      {userGifts.length} GIFTS
                    </span>
                  </div>
                  <div className="w-px h-5 bg-muted-foreground/30"></div>
                  <div className="text-center">
                    <span className="text-base font-semibold text-white">
                      {totalTON.toFixed(2)} TON
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

             {/* Main Content */}
       <div className="relative z-10 flex flex-col items-center justify-center min-h-[60vh] px-4">
         {userGifts.length === 0 ? (
           <>
             {/* Empty State - Magnifying Glass Icon */}
             <div className="relative mb-6">
               <div className="w-24 h-24 bg-gray-800/60 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-gray-600/50">
                 <div className="w-16 h-16 bg-gray-700/80 rounded-full flex items-center justify-center relative">
                   {/* Magnifying glass handle */}
                   <div className="absolute -bottom-2 -right-2 w-6 h-2 bg-gray-800 rounded-full transform rotate-45"></div>
                   {/* Magnifying glass circle */}
                   <div className="w-12 h-12 border-2 border-gray-400 rounded-full flex items-center justify-center relative">
                     {/* Blue glow effect */}
                     <div className="absolute inset-0 w-12 h-12 border-2 border-blue-400/30 rounded-full blur-sm"></div>
                     {/* Glass reflection */}
                     <div className="w-12 h-12 bg-gradient-to-br from-gray-300 to-gray-600 rounded-full flex items-center justify-center">
                       {/* Exclamation mark inside */}
                       <div className="w-1 h-6 bg-white rounded-full relative">
                         <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>
                       </div>
                     </div>
                   </div>
                 </div>
               </div>
             </div>

                               {/* Empty State Message */}
                  <div className="text-center mb-8 w-full px-4 flex flex-col items-center justify-center">
                    <p className="text-white text-4xl font-bold mb-4">No Gifts yet.</p>
                    <p className="text-white text-4xl font-bold mb-4">Buy one</p>
                    <p className="text-white text-4xl font-bold mb-4">in our Shop or send it</p>
                    <p className="text-white text-4xl font-bold mb-4">
                      to <span className="text-blue-400 font-medium">@rolls_transfer</span>
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 w-full px-4 fixed bottom-28 left-0 right-0 z-40">
                    <Button
                      className="inline-flex items-center justify-center whitespace-nowrap font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-ton text-white hover:bg-ton-light rounded-md px-8 flex-1 h-14 text-base"
                    >
                      Send Gifts
                    </Button>
                    <Button
                      className="inline-flex items-center justify-center whitespace-nowrap font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-ton text-white hover:bg-ton-light rounded-md px-8 flex-1 h-14 text-base"
                    >
                      Go to Shop
                    </Button>
                  </div>
           </>
         ) : (
           <>
             {/* Gifts List */}
             <div className="w-full max-w-md">
               <h2 className="text-2xl font-bold text-white text-center mb-6">Your Gifts</h2>
               <div className="space-y-3 max-h-[50vh] overflow-y-auto">
                 {userGifts.map((gift, index) => (
                   <div key={index} className="bg-gray-800/60 backdrop-blur-sm rounded-lg p-4 border border-gray-600/50">
                     <div className="flex items-center gap-4">
                       {/* Gift Icon */}
                       <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                         <span className="text-2xl">{gift.image}</span>
                       </div>
                       {/* Gift Info */}
                       <div className="flex-1">
                         <h3 className="text-white font-semibold text-lg">{gift.name}</h3>
                         <p className="text-gray-300 text-sm capitalize">{gift.rarity}</p>
                       </div>
                       {/* TON Value */}
                       <div className="text-right">
                         <div className="flex items-center gap-1">
                           <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                             <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                           </svg>
                           <span className="text-white font-bold text-lg">{gift.value} TON</span>
                         </div>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
             </div>
           </>
         )}
       </div>

                               {/* Bottom Navigation Menu */}
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 z-50">
          <div className="flex items-center justify-around max-w-md mx-auto">
            {/* PvP */}
            <div 
              className="flex flex-col items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => onPageChange('pvp')}
            >
              <div className="w-8 h-8 flex items-center justify-center">
                <svg className={`w-6 h-6 ${currentPage === 'pvp' ? 'text-white' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" transform="rotate(180 12 12)" />
                </svg>
              </div>
              <span className={`text-sm font-medium ${currentPage === 'pvp' ? 'text-white' : 'text-gray-400'}`}>PvP</span>
            </div>
            
            {/* Rolls */}
            <div className="flex flex-col items-center gap-2 cursor-pointer opacity-50">
              <div className="w-8 h-8 flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <span className="text-sm text-gray-400 font-medium">Rolls</span>
            </div>
            
            {/* Inventory - Active */}
            <div className="flex flex-col items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <span className="text-sm text-white font-medium">Inventory</span>
            </div>
            
            {/* Shop */}
            <div className="flex flex-col items-center gap-2 cursor-pointer opacity-50">
              <div className="w-8 h-8 flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                </svg>
              </div>
              <span className="text-sm text-gray-400 font-medium">Shop</span>
            </div>
            
            {/* Earn */}
            <div className="flex flex-col items-center gap-2 cursor-pointer opacity-50">
              <div className="w-8 h-8 flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <span className="text-sm text-gray-400 font-medium">Earn</span>
            </div>
          </div>
        </div>
    </div>
  );
};


/**
 * Service to handle cleanup of abandoned payment sessions and temporary data
 */
class PaymentCleanupService {
  private readonly TEMP_STORAGE_KEY = 'tempProductSubmission';
  private readonly CLEANUP_INTERVAL = 30 * 60 * 1000; // 30 minutes
  private readonly DATA_EXPIRY = 60 * 60 * 1000; // 1 hour

  /**
   * Initialize cleanup service - automatically cleans up old temporary data
   */
  init() {
    // Clean up on page load
    this.cleanupOldTempData();
    
    // Set up periodic cleanup
    setInterval(() => {
      this.cleanupOldTempData();
    }, this.CLEANUP_INTERVAL);
    
    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
      this.cleanupOldTempData();
    });
  }

  /**
   * Store temporary submission data
   */
  storeTempSubmission(data: any) {
    try {
      const tempData = {
        ...data,
        timestamp: Date.now(),
        id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
      localStorage.setItem(this.TEMP_STORAGE_KEY, JSON.stringify(tempData));
      console.log('Stored temporary submission:', tempData.id);
    } catch (error) {
      console.error('Error storing temp submission:', error);
    }
  }

  /**
   * Retrieve temporary submission data
   */
  getTempSubmission() {
    try {
      const stored = localStorage.getItem(this.TEMP_STORAGE_KEY);
      if (!stored) return null;
      
      const data = JSON.parse(stored);
      
      // Check if data is too old
      if (Date.now() - data.timestamp > this.DATA_EXPIRY) {
        console.log('Temp submission expired, clearing...');
        this.clearTempSubmission();
        return null;
      }
      
      console.log('Retrieved temp submission:', data.id);
      return data;
    } catch (error) {
      console.error('Error retrieving temp submission:', error);
      this.clearTempSubmission();
      return null;
    }
  }

  /**
   * Clear temporary submission data
   */
  clearTempSubmission() {
    try {
      localStorage.removeItem(this.TEMP_STORAGE_KEY);
      console.log('Cleared temporary submission data');
    } catch (error) {
      console.error('Error clearing temp submission:', error);
    }
  }

  /**
   * Clean up old temporary data
   */
  private cleanupOldTempData() {
    try {
      const stored = localStorage.getItem(this.TEMP_STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        
        // If data is older than expiry time, remove it
        if (Date.now() - data.timestamp > this.DATA_EXPIRY) {
          this.clearTempSubmission();
          console.log('Cleaned up old temporary submission data');
        }
      }
    } catch (error) {
      console.error('Error during cleanup:', error);
      // Clear corrupted data
      this.clearTempSubmission();
    }
  }

  /**
   * Check if there's a recovery session available
   */
  hasRecoveryData(): boolean {
    return this.getTempSubmission() !== null;
  }

  /**
   * Get human-readable time since last submission attempt
   */
  getTimeSinceLastAttempt(): string | null {
    const data = this.getTempSubmission();
    if (!data) return null;
    
    const timeDiff = Date.now() - data.timestamp;
    const minutes = Math.floor(timeDiff / (1000 * 60));
    
    if (minutes < 1) return 'less than a minute ago';
    if (minutes === 1) return '1 minute ago';
    return `${minutes} minutes ago`;
  }

  /**
   * Update timestamp of existing temp submission
   */
  updateTempSubmissionTimestamp() {
    try {
      const data = this.getTempSubmission();
      if (data) {
        data.timestamp = Date.now();
        localStorage.setItem(this.TEMP_STORAGE_KEY, JSON.stringify(data));
        console.log('Updated temp submission timestamp');
      }
    } catch (error) {
      console.error('Error updating temp submission timestamp:', error);
    }
  }
}

export const paymentCleanupService = new PaymentCleanupService();

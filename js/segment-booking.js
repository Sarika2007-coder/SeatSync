/**
 * Segment-Based Booking Handler
 * Manages boarding and dropping stops for intermediate stop bookings
 */

class SegmentBooking {
    constructor() {
        this.scheduleId = null;
        this.busId = null;
        this.stops = [];
        this.selectedBoardingStop = null;
        this.selectedDroppingStop = null;
    }

    /**
     * Load stops for a bus schedule
     */
    async loadStops(scheduleId) {
        try {
            this.scheduleId = scheduleId;
            const response = await fetch(`/api/segments/${scheduleId}`);
            const result = await response.json();
            
            if (!result.success) {
                alert(result.message || "Failed to load stops");
                return false;
            }
            
            this.stops = result.stops || [];
            return true;
        } catch (err) {
            console.error("Error loading stops:", err);
            alert("Error loading stops. Please try again.");
            return false;
        }
    }

    /**
     * Get available seats for a segment
     */
    async getAvailableSeats(boardingStopSeq, droppingStopSeq) {
        try {
            if (boardingStopSeq >= droppingStopSeq) {
                alert("Dropping stop must be after boarding stop");
                return null;
            }

            const url = `/api/seats/segment-availability?scheduleId=${this.scheduleId}&boardingStopSeq=${boardingStopSeq}&droppingStopSeq=${droppingStopSeq}`;
            const response = await fetch(url);
            const result = await response.json();
            
            if (!result.success) {
                alert(result.message || "Failed to load seat availability");
                return null;
            }
            
            return result;
        } catch (err) {
            console.error("Error getting available seats:", err);
            alert("Error loading seat availability. Please try again.");
            return null;
        }
    }

    /**
     * Book a seat with intermediate stops
     */
    async bookSeat(bookingData) {
        try {
            const response = await fetch("/api/bookings/segment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bookingData)
            });
            
            const result = await response.json();
            
            if (!result.success) {
                alert(result.message || "Booking failed");
                return false;
            }
            
            return result;
        } catch (err) {
            console.error("Error booking seat:", err);
            alert("Booking failed. Please try again.");
            return false;
        }
    }

    /**
     * Update exit stop for an existing booking
     */
    async updateExitStop(bookingId, exitStop) {
        try {
            const response = await fetch(`/api/bookings/${bookingId}/exit-stop`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    exitStopId: exitStop.id,
                    exitStopName: exitStop.name,
                    exitStopSeq: exitStop.sequence
                })
            });
            
            const result = await response.json();
            
            if (!result.success) {
                alert(result.message || "Failed to update exit stop");
                return false;
            }
            
            return result;
        } catch (err) {
            console.error("Error updating exit stop:", err);
            alert("Error updating exit stop. Please try again.");
            return false;
        }
    }

    /**
     * Create HTML for stop selector dropdown
     */
    createStopSelector(label, stopFilterFn) {
        const container = document.createElement("div");
        container.className = "stop-selector-group";
        
        const labelEl = document.createElement("label");
        labelEl.textContent = label;
        labelEl.style.marginBottom = "8px";
        labelEl.style.display = "block";
        labelEl.style.fontWeight = "bold";
        
        const select = document.createElement("select");
        select.className = "stop-selector";
        select.style.width = "100%";
        select.style.padding = "10px";
        select.style.borderRadius = "5px";
        select.style.border = "2px solid #ddd";
        select.style.fontSize = "14px";
        select.style.marginBottom = "15px";
        
        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = `-- Select ${label.toLowerCase()} --`;
        defaultOption.disabled = true;
        defaultOption.selected = true;
        select.appendChild(defaultOption);
        
        this.stops.forEach(stop => {
            if (stopFilterFn && !stopFilterFn(stop)) return;
            
            const option = document.createElement("option");
            option.value = JSON.stringify({
                id: stop.id,
                sequence: stop.sequence,
                name: stop.name,
                arrivalTime: stop.arrival_time,
                departureTime: stop.departure_time
            });
            option.textContent = `${stop.name} (${stop.arrival_time || "—"})`;
            select.appendChild(option);
        });
        
        container.appendChild(labelEl);
        container.appendChild(select);
        
        return { container, select };
    }

    /**
     * Display stop selection UI
     */
    displayStopSelection(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = "<h3 style='margin-bottom: 20px;'>Select Boarding & Dropping Points</h3>";
        
        // Boarding stop selector
        const { container: boardingContainer, select: boardingSelect } = this.createStopSelector(
            "🚌 Boarding Point",
            null // Show all stops
        );
        container.appendChild(boardingContainer);
        
        // Dropping stop selector (will be updated based on boarding selection)
        const { container: droppingContainer, select: droppingSelect } = this.createStopSelector(
            "🏁 Dropping Point",
            null
        );
        container.appendChild(droppingContainer);
        
        // Update dropping stops when boarding stop changes
        boardingSelect.addEventListener("change", (e) => {
            if (!e.target.value) return;
            
            const boardingStop = JSON.parse(e.target.value);
            this.selectedBoardingStop = boardingStop;
            
            // Clear and repopulate dropping stops (only show stops after boarding)
            droppingSelect.innerHTML = '<option disabled selected>-- Select Dropping Point --</option>';
            
            this.stops.forEach(stop => {
                if (stop.sequence <= boardingStop.sequence) return; // Skip stops before boarding
                
                const option = document.createElement("option");
                option.value = JSON.stringify({
                    id: stop.id,
                    sequence: stop.sequence,
                    name: stop.name,
                    arrivalTime: stop.arrival_time,
                    departureTime: stop.departure_time
                });
                option.textContent = `${stop.name} (${stop.arrival_time || "—"})`;
                droppingSelect.appendChild(option);
            });
        });
        
        // Track dropping stop selection
        droppingSelect.addEventListener("change", (e) => {
            if (!e.target.value) return;
            this.selectedDroppingStop = JSON.parse(e.target.value);
        });
        
        return { boardingSelect, droppingSelect };
    }

    /**
     * Get selected stops
     */
    getSelectedStops() {
        return {
            boarding: this.selectedBoardingStop,
            dropping: this.selectedDroppingStop
        };
    }

    /**
     * Validate segment selection
     */
    validateSegment() {
        if (!this.selectedBoardingStop) {
            alert("Please select a boarding point");
            return false;
        }
        if (!this.selectedDroppingStop) {
            alert("Please select a dropping point");
            return false;
        }
        if (this.selectedBoardingStop.sequence >= this.selectedDroppingStop.sequence) {
            alert("Dropping point must be after boarding point");
            return false;
        }
        return true;
    }
}

// Export for use in other scripts
const segmentBooking = new SegmentBooking();

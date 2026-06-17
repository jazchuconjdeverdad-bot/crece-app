-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 17-06-2026 a las 16:51:44
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `crece_db`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `alumnos`
--

CREATE TABLE `alumnos` (
  `id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `grade` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `alumnos`
--

INSERT INTO `alumnos` (`id`, `name`, `grade`) VALUES
(1, 'Agustín Cabrera', '5° A'),
(2, 'Belén Martínez', '5° A'),
(3, 'Carlos Ferreira', '5° B'),
(4, 'Daniela López', '5° C'),
(5, 'Enzo Silva', '6° A'),
(6, 'Florencia Rodríguez', '6° B'),
(7, 'Gonzalo Pereira', '6° C'),
(8, 'Juan', '5° A');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `asistencia`
--

CREATE TABLE `asistencia` (
  `id` int(11) NOT NULL,
  `student` varchar(150) NOT NULL,
  `grade` varchar(10) NOT NULL,
  `date` date NOT NULL,
  `status` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `asistencia`
--

INSERT INTO `asistencia` (`id`, `student`, `grade`, `date`, `status`) VALUES
(29, 'Juan', '5° A', '2026-06-17', 'Presente'),
(39, 'Belén Martínez', '5° A', '2026-06-17', 'Ausente'),
(40, 'Carlos Ferreira', '5° B', '2026-06-17', 'Ausente'),
(41, 'Daniela López', '5° C', '2026-06-17', 'Ausente'),
(42, 'Enzo Silva', '6° A', '2026-06-17', 'Ausente'),
(43, 'Florencia Rodríguez', '6° B', '2026-06-17', 'Ausente'),
(44, 'Gonzalo Pereira', '6° C', '2026-06-17', 'Ausente'),
(45, 'Juan', '5° A', '2026-06-17', 'Ausente'),
(47, 'Belén Martínez', '5° A', '2026-06-17', 'Ausente'),
(48, 'Carlos Ferreira', '5° B', '2026-06-17', 'Ausente'),
(49, 'Daniela López', '5° C', '2026-06-17', 'Ausente'),
(50, 'Enzo Silva', '6° A', '2026-06-17', 'Ausente'),
(51, 'Florencia Rodríguez', '6° B', '2026-06-17', 'Ausente'),
(52, 'Gonzalo Pereira', '6° C', '2026-06-17', 'Ausente'),
(53, 'Juan', '5° A', '2026-06-17', 'Ausente'),
(55, 'Belén Martínez', '5° A', '2026-06-17', 'Ausente'),
(56, 'Carlos Ferreira', '5° B', '2026-06-17', 'Ausente'),
(57, 'Daniela López', '5° C', '2026-06-17', 'Ausente'),
(58, 'Enzo Silva', '6° A', '2026-06-17', 'Ausente'),
(59, 'Florencia Rodríguez', '6° B', '2026-06-17', 'Ausente'),
(60, 'Gonzalo Pereira', '6° C', '2026-06-17', 'Ausente'),
(61, 'Juan', '5° A', '2026-06-17', 'Ausente'),
(63, 'Belén Martínez', '5° A', '2026-06-17', 'Ausente'),
(64, 'Carlos Ferreira', '5° B', '2026-06-17', 'Ausente'),
(65, 'Daniela López', '5° C', '2026-06-17', 'Ausente'),
(66, 'Enzo Silva', '6° A', '2026-06-17', 'Ausente'),
(67, 'Florencia Rodríguez', '6° B', '2026-06-17', 'Ausente'),
(68, 'Gonzalo Pereira', '6° C', '2026-06-17', 'Ausente'),
(69, 'Juan', '5° A', '2026-06-17', 'Ausente'),
(71, 'Belén Martínez', '5° A', '2026-06-17', 'Ausente'),
(72, 'Carlos Ferreira', '5° B', '2026-06-17', 'Ausente'),
(73, 'Daniela López', '5° C', '2026-06-17', 'Ausente'),
(74, 'Enzo Silva', '6° A', '2026-06-17', 'Ausente'),
(75, 'Florencia Rodríguez', '6° B', '2026-06-17', 'Ausente'),
(76, 'Gonzalo Pereira', '6° C', '2026-06-17', 'Ausente'),
(77, 'Juan', '5° A', '2026-06-17', 'Ausente'),
(78, 'Agustín Cabrera', '5° A', '2026-06-17', 'Ausente'),
(79, 'Belén Martínez', '5° A', '2026-06-17', 'Ausente'),
(80, 'Carlos Ferreira', '5° B', '2026-06-17', 'Ausente'),
(81, 'Daniela López', '5° C', '2026-06-17', 'Ausente'),
(82, 'Enzo Silva', '6° A', '2026-06-17', 'Ausente'),
(83, 'Florencia Rodríguez', '6° B', '2026-06-17', 'Ausente'),
(84, 'Gonzalo Pereira', '6° C', '2026-06-17', 'Ausente'),
(85, 'Juan', '5° A', '2026-06-17', 'Ausente'),
(86, 'Agustín Cabrera', '5° A', '2026-06-17', 'Ausente'),
(87, 'Belén Martínez', '5° A', '2026-06-17', 'Ausente'),
(88, 'Carlos Ferreira', '5° B', '2026-06-17', 'Ausente'),
(89, 'Daniela López', '5° C', '2026-06-17', 'Ausente'),
(90, 'Enzo Silva', '6° A', '2026-06-17', 'Ausente'),
(91, 'Florencia Rodríguez', '6° B', '2026-06-17', 'Ausente'),
(92, 'Gonzalo Pereira', '6° C', '2026-06-17', 'Ausente'),
(93, 'Juan', '5° A', '2026-06-17', 'Ausente'),
(94, 'Agustín Cabrera', '5° A', '2026-06-17', 'Ausente'),
(95, 'Belén Martínez', '5° A', '2026-06-17', 'Ausente'),
(96, 'Carlos Ferreira', '5° B', '2026-06-17', 'Ausente'),
(97, 'Daniela López', '5° C', '2026-06-17', 'Ausente'),
(98, 'Enzo Silva', '6° A', '2026-06-17', 'Ausente'),
(99, 'Florencia Rodríguez', '6° B', '2026-06-17', 'Ausente'),
(100, 'Gonzalo Pereira', '6° C', '2026-06-17', 'Ausente'),
(101, 'Juan', '5° A', '2026-06-17', 'Ausente'),
(102, 'Agustín Cabrera', '5° A', '2026-06-17', 'Ausente'),
(103, 'Belén Martínez', '5° A', '2026-06-17', 'Ausente'),
(104, 'Carlos Ferreira', '5° B', '2026-06-17', 'Ausente'),
(105, 'Daniela López', '5° C', '2026-06-17', 'Ausente'),
(106, 'Enzo Silva', '6° A', '2026-06-17', 'Ausente'),
(107, 'Florencia Rodríguez', '6° B', '2026-06-17', 'Ausente'),
(108, 'Gonzalo Pereira', '6° C', '2026-06-17', 'Ausente'),
(109, 'Juan', '5° A', '2026-06-17', 'Ausente'),
(110, 'Agustín Cabrera', '5° A', '2026-06-17', 'Ausente'),
(111, 'Belén Martínez', '5° A', '2026-06-17', 'Ausente'),
(112, 'Carlos Ferreira', '5° B', '2026-06-17', 'Ausente'),
(113, 'Daniela López', '5° C', '2026-06-17', 'Ausente'),
(114, 'Enzo Silva', '6° A', '2026-06-17', 'Ausente'),
(115, 'Florencia Rodríguez', '6° B', '2026-06-17', 'Ausente'),
(116, 'Gonzalo Pereira', '6° C', '2026-06-17', 'Ausente'),
(117, 'Juan', '5° A', '2026-06-17', 'Ausente'),
(118, 'Agustín Cabrera', '5° A', '2026-06-17', 'Ausente'),
(119, 'Belén Martínez', '5° A', '2026-06-17', 'Ausente'),
(120, 'Carlos Ferreira', '5° B', '2026-06-17', 'Ausente'),
(121, 'Daniela López', '5° C', '2026-06-17', 'Ausente'),
(122, 'Enzo Silva', '6° A', '2026-06-17', 'Ausente'),
(123, 'Florencia Rodríguez', '6° B', '2026-06-17', 'Ausente'),
(124, 'Gonzalo Pereira', '6° C', '2026-06-17', 'Ausente'),
(125, 'Juan', '5° A', '2026-06-17', 'Ausente'),
(126, 'Agustín Cabrera', '5° A', '2026-06-17', 'Ausente'),
(127, 'Belén Martínez', '5° A', '2026-06-17', 'Ausente'),
(128, 'Carlos Ferreira', '5° B', '2026-06-17', 'Ausente'),
(129, 'Daniela López', '5° C', '2026-06-17', 'Ausente'),
(130, 'Enzo Silva', '6° A', '2026-06-17', 'Ausente'),
(131, 'Florencia Rodríguez', '6° B', '2026-06-17', 'Ausente'),
(132, 'Gonzalo Pereira', '6° C', '2026-06-17', 'Ausente'),
(133, 'Juan', '5° A', '2026-06-17', 'Ausente'),
(134, 'Agustín Cabrera', '5° A', '2026-06-17', 'Ausente'),
(135, 'Belén Martínez', '5° A', '2026-06-17', 'Ausente'),
(136, 'Carlos Ferreira', '5° B', '2026-06-17', 'Ausente'),
(137, 'Daniela López', '5° C', '2026-06-17', 'Ausente'),
(138, 'Enzo Silva', '6° A', '2026-06-17', 'Ausente'),
(139, 'Florencia Rodríguez', '6° B', '2026-06-17', 'Ausente'),
(140, 'Gonzalo Pereira', '6° C', '2026-06-17', 'Ausente'),
(141, 'Juan', '5° A', '2026-06-17', 'Ausente'),
(142, 'Agustín Cabrera', '5° A', '2026-06-17', 'Ausente'),
(143, 'Belén Martínez', '5° A', '2026-06-17', 'Ausente'),
(144, 'Carlos Ferreira', '5° B', '2026-06-17', 'Ausente'),
(145, 'Daniela López', '5° C', '2026-06-17', 'Ausente'),
(146, 'Enzo Silva', '6° A', '2026-06-17', 'Ausente'),
(147, 'Florencia Rodríguez', '6° B', '2026-06-17', 'Ausente'),
(148, 'Gonzalo Pereira', '6° C', '2026-06-17', 'Ausente'),
(149, 'Juan', '5° A', '2026-06-17', 'Ausente'),
(150, 'Agustín Cabrera', '5° A', '2026-06-17', 'Ausente'),
(151, 'Belén Martínez', '5° A', '2026-06-17', 'Ausente'),
(152, 'Carlos Ferreira', '5° B', '2026-06-17', 'Ausente'),
(153, 'Daniela López', '5° C', '2026-06-17', 'Ausente'),
(154, 'Enzo Silva', '6° A', '2026-06-17', 'Ausente'),
(155, 'Florencia Rodríguez', '6° B', '2026-06-17', 'Ausente'),
(156, 'Gonzalo Pereira', '6° C', '2026-06-17', 'Ausente'),
(157, 'Juan', '5° A', '2026-06-17', 'Ausente'),
(158, 'Agustín Cabrera', '5° A', '2026-06-17', 'Ausente'),
(159, 'Belén Martínez', '5° A', '2026-06-17', 'Ausente'),
(160, 'Carlos Ferreira', '5° B', '2026-06-17', 'Ausente'),
(161, 'Daniela López', '5° C', '2026-06-17', 'Ausente'),
(162, 'Enzo Silva', '6° A', '2026-06-17', 'Ausente'),
(163, 'Florencia Rodríguez', '6° B', '2026-06-17', 'Ausente'),
(164, 'Gonzalo Pereira', '6° C', '2026-06-17', 'Ausente'),
(165, 'Juan', '5° A', '2026-06-17', 'Ausente'),
(166, 'Agustín Cabrera', '5° A', '2026-06-17', 'Ausente'),
(167, 'Belén Martínez', '5° A', '2026-06-17', 'Ausente'),
(168, 'Carlos Ferreira', '5° B', '2026-06-17', 'Ausente'),
(169, 'Daniela López', '5° C', '2026-06-17', 'Ausente'),
(170, 'Enzo Silva', '6° A', '2026-06-17', 'Ausente'),
(171, 'Florencia Rodríguez', '6° B', '2026-06-17', 'Ausente'),
(172, 'Gonzalo Pereira', '6° C', '2026-06-17', 'Ausente'),
(173, 'Juan', '5° A', '2026-06-17', 'Ausente');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `attendance`
--

CREATE TABLE `attendance` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `status` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `attendance`
--

INSERT INTO `attendance` (`id`, `student_id`, `date`, `status`) VALUES
(1, 62, '2026-06-17', 'Presente'),
(2, 13, '2026-06-17', 'Presente'),
(3, 56, '2026-06-17', 'Ausente'),
(4, 15, '2026-06-17', 'Presente'),
(5, 51, '2026-06-17', 'Presente'),
(6, 8, '2026-06-17', 'Ausente'),
(7, 6, '2026-06-17', 'Ausente'),
(8, 45, '2026-06-17', 'Presente'),
(9, 42, '2026-06-17', 'Presente'),
(10, 44, '2026-06-17', 'Presente'),
(11, 34, '2026-06-17', 'Ausente'),
(12, 64, '2026-06-17', 'Presente'),
(13, 47, '2026-06-17', 'Presente'),
(14, 53, '2026-06-17', 'Presente'),
(15, 28, '2026-06-17', 'Ausente'),
(16, 72, '2026-06-17', 'Ausente'),
(17, 66, '2026-06-17', 'Ausente'),
(18, 33, '2026-06-17', 'Presente'),
(19, 69, '2026-06-17', 'Presente'),
(20, 55, '2026-06-17', 'Presente'),
(21, 17, '2026-06-17', 'Ausente'),
(22, 40, '2026-06-17', 'Ausente'),
(23, 18, '2026-06-17', 'Ausente'),
(24, 43, '2026-06-17', 'Ausente'),
(25, 37, '2026-06-17', 'Ausente'),
(26, 50, '2026-06-17', 'Ausente'),
(27, 27, '2026-06-17', 'Ausente'),
(28, 46, '2026-06-17', 'Ausente'),
(29, 21, '2026-06-17', 'Ausente'),
(30, 54, '2026-06-17', 'Ausente'),
(31, 60, '2026-06-17', 'Ausente'),
(32, 3, '2026-06-17', 'Ausente'),
(33, 22, '2026-06-17', 'Ausente'),
(34, 48, '2026-06-17', 'Ausente'),
(35, 25, '2026-06-17', 'Ausente'),
(36, 7, '2026-06-17', 'Ausente'),
(37, 4, '2026-06-17', 'Ausente'),
(38, 35, '2026-06-17', 'Ausente'),
(39, 36, '2026-06-17', 'Ausente'),
(40, 23, '2026-06-17', 'Ausente'),
(41, 63, '2026-06-17', 'Ausente'),
(42, 16, '2026-06-17', 'Ausente'),
(43, 59, '2026-06-17', 'Ausente'),
(44, 39, '2026-06-17', 'Ausente'),
(45, 2, '2026-06-17', 'Ausente'),
(46, 1, '2026-06-17', 'Ausente'),
(47, 10, '2026-06-17', 'Presente'),
(48, 5, '2026-06-17', 'Presente'),
(49, 12, '2026-06-17', 'Ausente'),
(50, 9, '2026-06-17', 'Presente'),
(51, 30, '2026-06-17', 'Ausente'),
(52, 11, '2026-06-17', 'Ausente'),
(53, 65, '2026-06-17', 'Ausente'),
(54, 67, '2026-06-17', 'Ausente'),
(55, 26, '2026-06-17', 'Ausente'),
(56, 61, '2026-06-17', 'Ausente'),
(57, 57, '2026-06-17', 'Ausente'),
(58, 31, '2026-06-17', 'Ausente'),
(59, 38, '2026-06-17', 'Ausente'),
(60, 41, '2026-06-17', 'Ausente'),
(61, 71, '2026-06-17', 'Ausente'),
(62, 14, '2026-06-17', 'Ausente'),
(63, 52, '2026-06-17', 'Ausente'),
(64, 68, '2026-06-17', 'Ausente'),
(65, 32, '2026-06-17', 'Ausente'),
(66, 20, '2026-06-17', 'Ausente'),
(67, 19, '2026-06-17', 'Ausente'),
(68, 49, '2026-06-17', 'Ausente'),
(69, 29, '2026-06-17', 'Ausente'),
(70, 24, '2026-06-17', 'Ausente'),
(71, 70, '2026-06-17', 'Ausente'),
(72, 74, '2026-06-17', 'Ausente'),
(73, 58, '2026-06-17', 'Ausente'),
(74, 73, '2026-06-17', 'Ausente'),
(2740, 62, '2026-06-01', 'Ausente'),
(2741, 13, '2026-06-01', 'Ausente'),
(2742, 56, '2026-06-01', 'Ausente'),
(2743, 15, '2026-06-01', 'Ausente'),
(2744, 51, '2026-06-01', 'Ausente'),
(2745, 8, '2026-06-01', 'Ausente'),
(2746, 6, '2026-06-01', 'Ausente'),
(2747, 45, '2026-06-01', 'Ausente'),
(2748, 42, '2026-06-01', 'Ausente'),
(2749, 44, '2026-06-01', 'Ausente'),
(2750, 34, '2026-06-01', 'Ausente'),
(2751, 64, '2026-06-01', 'Ausente'),
(2752, 47, '2026-06-01', 'Ausente'),
(2753, 53, '2026-06-01', 'Ausente'),
(2754, 28, '2026-06-01', 'Ausente'),
(2755, 72, '2026-06-01', 'Ausente'),
(2756, 66, '2026-06-01', 'Ausente'),
(2757, 33, '2026-06-01', 'Ausente'),
(2758, 69, '2026-06-01', 'Ausente'),
(2759, 55, '2026-06-01', 'Ausente'),
(2760, 17, '2026-06-01', 'Ausente'),
(2761, 40, '2026-06-01', 'Ausente'),
(2762, 18, '2026-06-01', 'Ausente'),
(2763, 43, '2026-06-01', 'Ausente'),
(2764, 37, '2026-06-01', 'Ausente'),
(2765, 50, '2026-06-01', 'Ausente'),
(2766, 27, '2026-06-01', 'Ausente'),
(2767, 46, '2026-06-01', 'Ausente'),
(2768, 21, '2026-06-01', 'Ausente'),
(2769, 54, '2026-06-01', 'Ausente'),
(2770, 60, '2026-06-01', 'Ausente'),
(2771, 3, '2026-06-01', 'Ausente'),
(2772, 22, '2026-06-01', 'Ausente'),
(2773, 48, '2026-06-01', 'Ausente'),
(2774, 25, '2026-06-01', 'Ausente'),
(2775, 7, '2026-06-01', 'Ausente'),
(2776, 4, '2026-06-01', 'Ausente'),
(2777, 35, '2026-06-01', 'Ausente'),
(2778, 36, '2026-06-01', 'Ausente'),
(2779, 23, '2026-06-01', 'Ausente'),
(2780, 63, '2026-06-01', 'Ausente'),
(2781, 16, '2026-06-01', 'Ausente'),
(2782, 59, '2026-06-01', 'Ausente'),
(2783, 39, '2026-06-01', 'Ausente'),
(2784, 2, '2026-06-01', 'Ausente'),
(2785, 1, '2026-06-01', 'Ausente'),
(2786, 10, '2026-06-01', 'Ausente'),
(2787, 5, '2026-06-01', 'Ausente'),
(2788, 12, '2026-06-01', 'Ausente'),
(2789, 9, '2026-06-01', 'Ausente'),
(2790, 30, '2026-06-01', 'Ausente'),
(2791, 11, '2026-06-01', 'Ausente'),
(2792, 65, '2026-06-01', 'Ausente'),
(2793, 67, '2026-06-01', 'Ausente'),
(2794, 26, '2026-06-01', 'Ausente'),
(2795, 61, '2026-06-01', 'Ausente'),
(2796, 57, '2026-06-01', 'Ausente'),
(2797, 62, '2026-06-18', 'Ausente'),
(2798, 31, '2026-06-01', 'Ausente'),
(2799, 13, '2026-06-18', 'Ausente'),
(2800, 38, '2026-06-01', 'Ausente'),
(2801, 56, '2026-06-18', 'Ausente'),
(2802, 41, '2026-06-01', 'Ausente'),
(2803, 15, '2026-06-18', 'Ausente'),
(2804, 71, '2026-06-01', 'Ausente'),
(2805, 51, '2026-06-18', 'Ausente'),
(2806, 14, '2026-06-01', 'Ausente'),
(2807, 8, '2026-06-18', 'Ausente'),
(2808, 52, '2026-06-01', 'Ausente'),
(2809, 6, '2026-06-18', 'Ausente'),
(2810, 68, '2026-06-01', 'Ausente'),
(2811, 45, '2026-06-18', 'Ausente'),
(2812, 32, '2026-06-01', 'Ausente'),
(2813, 42, '2026-06-18', 'Ausente'),
(2814, 20, '2026-06-01', 'Ausente'),
(2815, 44, '2026-06-18', 'Ausente'),
(2816, 19, '2026-06-01', 'Ausente'),
(2817, 34, '2026-06-18', 'Ausente'),
(2818, 49, '2026-06-01', 'Ausente'),
(2819, 64, '2026-06-18', 'Ausente'),
(2820, 29, '2026-06-01', 'Ausente'),
(2821, 47, '2026-06-18', 'Ausente'),
(2822, 24, '2026-06-01', 'Ausente'),
(2823, 53, '2026-06-18', 'Ausente'),
(2824, 70, '2026-06-01', 'Ausente'),
(2825, 28, '2026-06-18', 'Ausente'),
(2826, 74, '2026-06-01', 'Ausente'),
(2827, 72, '2026-06-18', 'Ausente'),
(2828, 58, '2026-06-01', 'Ausente'),
(2829, 66, '2026-06-18', 'Ausente'),
(2830, 73, '2026-06-01', 'Ausente'),
(2831, 33, '2026-06-18', 'Ausente'),
(2832, 69, '2026-06-18', 'Ausente'),
(2833, 55, '2026-06-18', 'Ausente'),
(2834, 17, '2026-06-18', 'Ausente'),
(2835, 40, '2026-06-18', 'Ausente'),
(2836, 18, '2026-06-18', 'Ausente'),
(2837, 43, '2026-06-18', 'Ausente'),
(2838, 37, '2026-06-18', 'Ausente'),
(2839, 50, '2026-06-18', 'Ausente'),
(2840, 27, '2026-06-18', 'Ausente'),
(2841, 46, '2026-06-18', 'Ausente'),
(2842, 21, '2026-06-18', 'Ausente'),
(2843, 54, '2026-06-18', 'Ausente'),
(2844, 60, '2026-06-18', 'Ausente'),
(2845, 3, '2026-06-18', 'Ausente'),
(2846, 22, '2026-06-18', 'Ausente'),
(2847, 48, '2026-06-18', 'Ausente'),
(2848, 25, '2026-06-18', 'Ausente'),
(2849, 7, '2026-06-18', 'Ausente'),
(2850, 4, '2026-06-18', 'Ausente'),
(2851, 35, '2026-06-18', 'Ausente'),
(2852, 36, '2026-06-18', 'Ausente'),
(2853, 23, '2026-06-18', 'Ausente'),
(2854, 63, '2026-06-18', 'Ausente'),
(2855, 16, '2026-06-18', 'Ausente'),
(2856, 59, '2026-06-18', 'Ausente'),
(2857, 39, '2026-06-18', 'Ausente'),
(2858, 2, '2026-06-18', 'Ausente'),
(2859, 1, '2026-06-18', 'Ausente'),
(2860, 10, '2026-06-18', 'Ausente'),
(2861, 5, '2026-06-18', 'Ausente'),
(2862, 12, '2026-06-18', 'Ausente'),
(2863, 9, '2026-06-18', 'Ausente'),
(2864, 30, '2026-06-18', 'Ausente'),
(2865, 11, '2026-06-18', 'Ausente'),
(2866, 65, '2026-06-18', 'Ausente'),
(2867, 67, '2026-06-18', 'Ausente'),
(2868, 26, '2026-06-18', 'Ausente'),
(2869, 61, '2026-06-18', 'Ausente'),
(2870, 57, '2026-06-18', 'Ausente'),
(2871, 31, '2026-06-18', 'Ausente'),
(2872, 38, '2026-06-18', 'Ausente'),
(2873, 41, '2026-06-18', 'Ausente'),
(2874, 71, '2026-06-18', 'Ausente'),
(2875, 14, '2026-06-18', 'Ausente'),
(2876, 52, '2026-06-18', 'Ausente'),
(2877, 68, '2026-06-18', 'Ausente'),
(2878, 32, '2026-06-18', 'Ausente'),
(2879, 20, '2026-06-18', 'Ausente'),
(2880, 19, '2026-06-18', 'Ausente'),
(2881, 49, '2026-06-18', 'Ausente'),
(2882, 29, '2026-06-18', 'Ausente'),
(2883, 24, '2026-06-18', 'Ausente'),
(2884, 70, '2026-06-18', 'Ausente'),
(2885, 74, '2026-06-18', 'Ausente'),
(2886, 58, '2026-06-18', 'Ausente'),
(2887, 73, '2026-06-18', 'Ausente');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `galeria`
--

CREATE TABLE `galeria` (
  `id` int(11) NOT NULL,
  `title` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `grade` varchar(10) NOT NULL,
  `date` date NOT NULL,
  `src` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `galeria`
--

INSERT INTO `galeria` (`id`, `title`, `description`, `grade`, `date`, `src`) VALUES
(7, 'Brunito Programando', 'Actividad recreativa y de aprendizaje', '5°', '2026-06-17', '/uploads/1781702116101-342065646.jpg');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `guiones`
--

CREATE TABLE `guiones` (
  `id` int(11) NOT NULL,
  `title` varchar(150) NOT NULL,
  `grade` varchar(10) NOT NULL,
  `subject` varchar(100) NOT NULL,
  `date` date NOT NULL,
  `pdf_url` varchar(255) NOT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `guiones`
--

INSERT INTO `guiones` (`id`, `title`, `grade`, `subject`, `date`, `pdf_url`, `description`) VALUES
(17, 'Taller de Programación 1', '6°', 'Programación', '2026-06-17', '/uploads/1781703056404-795829149.pdf', 'Taller de la clase 1 de Programación');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mensajes_contacto`
--

CREATE TABLE `mensajes_contacto` (
  `id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `email` varchar(150) NOT NULL,
  `subject` varchar(150) NOT NULL,
  `message` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `mensajes_contacto`
--

INSERT INTO `mensajes_contacto` (`id`, `name`, `email`, `subject`, `message`, `created_at`) VALUES
(1, 'jaja', 'jazchuconjdeverdad@gmail.com', 'hola', 'FUNCIONA EEEEEEEEEEE', '2026-06-17 14:43:24');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `proyectos`
--

CREATE TABLE `proyectos` (
  `id` int(11) NOT NULL,
  `title` varchar(150) NOT NULL,
  `author` varchar(150) NOT NULL,
  `grade` varchar(10) NOT NULL,
  `description` text DEFAULT NULL,
  `scratch_url` varchar(255) NOT NULL,
  `thumbnail` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `proyectos`
--

INSERT INTO `proyectos` (`id`, `title`, `author`, `grade`, `description`, `scratch_url`, `thumbnail`) VALUES
(13, 'Simulador de Circuito Vial', 'Equipo Alfa - 5° Grado', '5°', 'Un simulador interactivo de semáforos y cruces peatonales inteligentes desarrollado en Scratch.', 'https://scratch.mit.edu/projects/1012345678/embed', 'img/scratch_vial.png'),
(14, 'Laberinto del Saber Informático', 'Sofía Duarte y Lucas Ríos - 5° Grado', '5°', 'Un divertido juego de laberintos donde para avanzar debes responder preguntas de hardware, software y redes.', 'https://scratch.mit.edu/projects/1012345679/embed', 'img/scratch_laberinto.png'),
(15, 'Calculadora de Matrices Binarias', 'Matías Gómez - 6° Grado', '6°', 'Herramienta que realiza conversiones entre sistemas numéricos decimales, binarios y hexadecimales.', 'https://scratch.mit.edu/projects/1012345680/embed', 'img/scratch_calculadora.png'),
(16, 'Panel de Domótica Virtual', 'Equipo IoT - 6° Grado', '6°', 'Simulador de una casa inteligente con alarmas, luces y sensores de temperatura.', 'https://scratch.mit.edu/projects/1012345681/embed', 'img/scratch_domotica.png');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `students`
--

CREATE TABLE `students` (
  `id` int(11) NOT NULL,
  `full_name` varchar(150) NOT NULL,
  `course` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `students`
--

INSERT INTO `students` (`id`, `full_name`, `course`) VALUES
(62, 'Agustín Mendoza', '6° C'),
(13, 'Alejandro Silva', '5° B'),
(56, 'Alma Díaz', '6° B'),
(15, 'Alma Herrera', '5° B'),
(51, 'Alma Morales', '6° B'),
(8, 'Alma Pérez', '5° A'),
(6, 'Alma Rivera', '5° A'),
(45, 'Antonella Gómez', '6° A'),
(42, 'Antonella Sánchez', '6° A'),
(44, 'Antonella Silva', '6° A'),
(34, 'Camila García', '5° D'),
(64, 'Camila Martínez', '6° C'),
(47, 'Camila Medina', '6° A'),
(53, 'Camila Romero', '6° B'),
(28, 'Camila Ruiz', '5° C'),
(72, 'Camila Silva', '6° D'),
(66, 'Camila Torres', '6° C'),
(33, 'Catalina Gutiérrez', '5° D'),
(69, 'Daniel Díaz', '6° C'),
(55, 'Daniel González', '6° B'),
(17, 'Emiliano Herrera', '5° B'),
(40, 'Emma Pérez', '5° D'),
(18, 'Emma Reyes', '5° B'),
(43, 'Facundo Cruz', '6° A'),
(37, 'Facundo Mendoza', '5° D'),
(50, 'Isabella Aguilar', '6° A'),
(27, 'Isabella Castro', '5° C'),
(46, 'Isabella Cruz', '6° A'),
(21, 'Isabella Herrera', '5° C'),
(54, 'Isabella Romero', '6° B'),
(60, 'Isabella Ruiz', '6° B'),
(3, 'Isabella Vargas', '5° A'),
(22, 'Joaquín González', '5° C'),
(48, 'Joaquín Rivera', '6° A'),
(25, 'Julieta Chávez', '5° C'),
(7, 'Julieta Gómez', '5° A'),
(4, 'Lautaro Castro', '5° A'),
(35, 'Lautaro Jiménez', '5° D'),
(36, 'Lautaro Medina', '5° D'),
(23, 'Lautaro Ortiz', '5° C'),
(63, 'Lautaro Ramírez', '6° C'),
(16, 'Lautaro Rivera', '5° B'),
(59, 'Lautaro Ruiz', '6° B'),
(39, 'Lucía Castro', '5° D'),
(2, 'Lucía Ortiz', '5° A'),
(1, 'Mateo Gutiérrez', '5° A'),
(10, 'Mateo Rodríguez', '5° A'),
(5, 'Máximo Flores', '5° A'),
(12, 'Mía Jiménez', '5° B'),
(9, 'Mía Torres', '5° A'),
(30, 'Nicolás López', '5° C'),
(11, 'Nicolás Mendoza', '5° B'),
(65, 'Olivia Herrera', '6° C'),
(67, 'Olivia Ruiz', '6° C'),
(26, 'Renata Díaz', '5° C'),
(61, 'Renata Rodríguez', '6° C'),
(57, 'Santiago Gutiérrez', '6° B'),
(31, 'Santiago Morales', '5° D'),
(38, 'Sebastián Torres', '5° D'),
(41, 'Sebastián Vargas', '6° A'),
(71, 'Sofía Morales', '6° D'),
(14, 'Sofía Ortiz', '5° B'),
(52, 'Thiago Díaz', '6° B'),
(68, 'Thiago González', '6° C'),
(32, 'Thiago Pérez', '5° D'),
(20, 'Tomás Díaz', '5° B'),
(19, 'Valentina Cruz', '5° B'),
(49, 'Valentina Flores', '6° A'),
(29, 'Victoria Aguilar', '5° C'),
(24, 'Victoria Cruz', '5° C'),
(70, 'Victoria García', '6° C'),
(74, 'Victoria Gómez', '6° D'),
(58, 'Victoria López', '6° B'),
(73, 'Victoria Romero', '6° D');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(64) NOT NULL,
  `role` varchar(20) DEFAULT 'user',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`id`, `username`, `name`, `email`, `password`, `role`, `created_at`) VALUES
(1, 'admin', 'Admin Carlos', 'admin@crece.edu', 'e7c5e4e687eba0c36d42eb00e0b4779d98247b1932fbfa85d2eea25332ba2525', 'admin', '2026-06-17 14:29:34'),
(2, 'jazmin', 'jazmin', 'jazmin@gmail.com', '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', 'admin', '2026-06-17 14:40:25');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(64) NOT NULL,
  `role` varchar(20) DEFAULT 'user',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `username`, `password`, `role`, `created_at`) VALUES
(1, 'admin', 'e7c5e4e687eba0c36d42eb00e0b4779d98247b1932fbfa85d2eea25332ba2525', 'admin', '2026-06-17 12:34:14'),
(2, 'jazmin', '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', 'admin', '2026-06-17 12:34:49'),
(3, 'Aracely', '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', 'user', '2026-06-17 13:12:05');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `alumnos`
--
ALTER TABLE `alumnos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_alumno` (`name`,`grade`);

--
-- Indices de la tabla `asistencia`
--
ALTER TABLE `asistencia`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `attendance`
--
ALTER TABLE `attendance`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_attendance` (`student_id`,`date`);

--
-- Indices de la tabla `galeria`
--
ALTER TABLE `galeria`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `guiones`
--
ALTER TABLE `guiones`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `mensajes_contacto`
--
ALTER TABLE `mensajes_contacto`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `proyectos`
--
ALTER TABLE `proyectos`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_student` (`full_name`,`course`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `alumnos`
--
ALTER TABLE `alumnos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `asistencia`
--
ALTER TABLE `asistencia`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=174;

--
-- AUTO_INCREMENT de la tabla `attendance`
--
ALTER TABLE `attendance`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4691;

--
-- AUTO_INCREMENT de la tabla `galeria`
--
ALTER TABLE `galeria`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `guiones`
--
ALTER TABLE `guiones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT de la tabla `mensajes_contacto`
--
ALTER TABLE `mensajes_contacto`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `proyectos`
--
ALTER TABLE `proyectos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT de la tabla `students`
--
ALTER TABLE `students`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=75;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `attendance`
--
ALTER TABLE `attendance`
  ADD CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
